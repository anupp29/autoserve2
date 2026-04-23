// =====================================================================
// AI Maintenance Tips — RAG-grounded tips + catalog-validated services
// Accepts EITHER { vehicle_id } (server lookup) OR
// { make, model, year, mileage, fuel_type } (client-supplied).
// =====================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  corsHeaders, json, rateLimitOk, callLovableAi,
  retrieveKnowledge, formatKnowledgeForPrompt, safeStr, safeArray, logAiCall,
  KnowledgeEntry,
} from "../_shared/aiGuardrails.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface Body {
  vehicle_id?: string;
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  fuel_type?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const rl = rateLimitOk(req);
  if (!rl.ok) return json(429, { error: "Too many requests" }, { "Retry-After": String(rl.retryAfter ?? 30) });

  try {
    const body = (await req.json()) as Body;

    let vehicle: { make: string; model: string; year: number; mileage: number; fuel_type: string | null } | null = null;
    let recentServiceNames: string[] = [];

    if (body.vehicle_id) {
      const [{ data: v }, { data: history }] = await Promise.all([
        admin.from("vehicles").select("*").eq("id", body.vehicle_id).maybeSingle(),
        admin.from("service_history").select("service_id, service_date").eq("vehicle_id", body.vehicle_id).order("service_date", { ascending: false }).limit(10),
      ]);
      if (!v) return json(404, { error: "Vehicle not found" });
      vehicle = v as any;
      if (history?.length) {
        const ids = history.map((h: any) => h.service_id);
        const { data: svcs } = await admin.from("services").select("id, name").in("id", ids);
        recentServiceNames = (history as any[]).map((h) => svcs?.find((s: any) => s.id === h.service_id)?.name).filter(Boolean) as string[];
      }
    } else if (body.make && body.model && body.year != null) {
      vehicle = {
        make: body.make,
        model: body.model,
        year: body.year,
        mileage: body.mileage ?? 0,
        fuel_type: body.fuel_type ?? "Petrol",
      };
    } else {
      return json(400, { error: "Provide either vehicle_id or {make, model, year}" });
    }

    const { data: services } = await admin.from("services").select("id, name, category, price").eq("active", true);
    const catalog = (services ?? []).map((s: any) => `${s.name} [${s.category}] – ₹${s.price}`).join("\n");

    // RAG: build a query using vehicle attributes + recent services
    const ragQuery = `${vehicle!.year} ${vehicle!.make} ${vehicle!.model} ${vehicle!.fuel_type ?? "petrol"} ${vehicle!.mileage} km maintenance ${recentServiceNames.join(" ")}`;
    const { data: kb } = await admin.from("automotive_knowledge").select("*");
    const matches = retrieveKnowledge(ragQuery, (kb ?? []) as KnowledgeEntry[], {
      fuelType: vehicle!.fuel_type,
      topK: 3,
    });
    const knowledgeBlock = formatKnowledgeForPrompt(matches);

    const prompt = `Vehicle profile:
- ${vehicle!.year} ${vehicle!.make} ${vehicle!.model} (${vehicle!.fuel_type ?? "Petrol"})
- Current mileage: ${vehicle!.mileage} km
- Recent services: ${recentServiceNames.length ? recentServiceNames.join(", ") : "none recorded"}

EXPERT KNOWLEDGE BASE (use to ground tips, cite numerically):
${knowledgeBlock}

Workshop catalogue:
${catalog}

Return a JSON object with these exact fields:
{
  "tips": ["3 short, actionable maintenance tips specific to this vehicle's age, mileage, fuel type — cite [1] [2] when grounded in the knowledge base"],
  "recommended_service_names": ["1-3 service names from the catalogue above this customer should book next"]
}

Important:
- recommended_service_names MUST be exact names from the catalogue.
- Skip services already done in the last 30 days unless mileage warrants.
- For EVs (fuel_type = Electric), never recommend oil/spark plug services.
- Tips should be specific (not generic "check your tyres").`;

    const ai = await callLovableAi({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an expert automotive maintenance advisor for Indian car owners. Reply with valid JSON only, no preamble. Ground recommendations in the provided knowledge base." },
        { role: "user", content: prompt },
      ],
      responseFormat: "json",
    });
    logAiCall({ function: "ai-maintenance-tips", ragMatches: matches.length, ai });

    if (!ai.ok) return json(ai.status === 402 ? 402 : 503, { error: ai.error ?? "AI temporarily unavailable" });

    let parsed: any = {};
    const raw = ai.data?.choices?.[0]?.message?.content ?? "{}";
    try { parsed = JSON.parse(raw); } catch { parsed = { tips: [raw], recommended_service_names: [] }; }

    const tips = safeArray<string>(parsed.tips).map((t) => safeStr(t).slice(0, 240)).filter(Boolean).slice(0, 5);
    const names = safeArray<string>(parsed.recommended_service_names).map((n) => safeStr(n)).filter(Boolean);
    const recIds = names
      .map((n) => services?.find((s: any) => s.name.toLowerCase() === n.toLowerCase())?.id)
      .filter(Boolean);

    return json(200, {
      tips,
      recommended_service_ids: recIds,
      recommended_service_names: names,
      citations: matches.map((m, i) => ({ index: i + 1, title: m.title, category: m.category, source: m.source })),
      guardrails: { rag_sources_used: matches.length, ai_retries: ai.retries, ai_latency_ms: ai.latencyMs },
    });
  } catch (e) {
    console.error("ai-maintenance-tips fatal", e);
    return json(500, { error: String(e instanceof Error ? e.message : e) });
  }
});
