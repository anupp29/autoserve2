// =====================================================================
// AI Vehicle Summary — concise technician briefing from service history
//
// Accepts EITHER:
//   { vehicle_id }                                       — server fetches
//   { vehicle, history, current_service? }               — client-supplied
// =====================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  corsHeaders, json, rateLimitOk, callLovableAi,
  retrieveKnowledge, formatKnowledgeForPrompt, safeStr, logAiCall,
  KnowledgeEntry,
} from "../_shared/aiGuardrails.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const rl = rateLimitOk(req);
  if (!rl.ok) return json(429, { error: "Too many requests" }, { "Retry-After": String(rl.retryAfter ?? 30) });

  try {
    const body = await req.json();
    let vehicle: any = body.vehicle ?? null;
    let history: any[] = Array.isArray(body.history) ? body.history : [];
    const currentService: string | undefined = body.current_service;

    if (!vehicle && body.vehicle_id) {
      const [{ data: veh }, { data: hist }, { data: services }] = await Promise.all([
        admin.from("vehicles").select("*").eq("id", body.vehicle_id).maybeSingle(),
        admin.from("service_history").select("*").eq("vehicle_id", body.vehicle_id).order("service_date", { ascending: false }).limit(20),
        admin.from("services").select("id, name, category"),
      ]);
      if (!veh) return json(404, { error: "Vehicle not found" });
      vehicle = veh;
      const svcMap = new Map((services ?? []).map((s: any) => [s.id, s.name]));
      history = (hist ?? []).map((h: any) => ({ ...h, service: svcMap.get(h.service_id) ?? "Service" }));
    }

    if (!vehicle) return json(400, { error: "vehicle or vehicle_id required" });

    const histLines = history.map((h: any) => {
      const date = h.service_date
        ? new Date(h.service_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "Unknown date";
      return `- ${date} • ${h.service ?? "Service"} • ${h.mileage_at_service ?? "?"} km • ₹${h.cost ?? "?"} • Notes: ${h.notes ?? "—"} • Parts: ${h.parts_used ?? "—"}`;
    }).join("\n");

    // RAG: pull entries relevant to vehicle + current service
    const ragQuery = `${vehicle.make ?? ""} ${vehicle.model ?? ""} ${vehicle.fuel_type ?? "petrol"} ${currentService ?? ""} ${history.slice(0, 3).map((h: any) => h.service ?? "").join(" ")}`;
    const { data: kb } = await admin.from("automotive_knowledge").select("*");
    const matches = retrieveKnowledge(ragQuery, (kb ?? []) as KnowledgeEntry[], {
      fuelType: vehicle.fuel_type,
      topK: 2,
    });
    const knowledgeBlock = formatKnowledgeForPrompt(matches);

    const prompt = `You are an expert automotive service advisor briefing a technician about to work on this vehicle.

Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.fuel_type ?? "Petrol"})
Registration: ${vehicle.registration ?? "—"}
Current Odometer: ${vehicle.mileage ?? "?"} km
${currentService ? `Today's job: ${currentService}` : ""}

Service history (most recent first):
${histLines || "No prior service history."}

EXPERT REFERENCE:
${knowledgeBlock}

Write a concise 4-6 line briefing that:
1. Summarises the vehicle's overall maintenance state (well-maintained / needs attention / new vehicle).
2. Highlights any recurring issues or patterns.
3. Flags items likely due based on mileage and time gaps.
4. Suggests one specific check the technician should prioritise today.

Use plain, clear language. Flowing paragraphs only — no bullet points. Address the technician, not the customer.`;

    const ai = await callLovableAi({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are a senior automotive service advisor. Be concise, technical and actionable. Ground your reasoning in the supplied reference when applicable." },
        { role: "user", content: prompt },
      ],
    });
    logAiCall({ function: "ai-vehicle-summary", ragMatches: matches.length, ai });

    if (!ai.ok) return json(ai.status === 402 ? 402 : 503, { error: ai.error ?? "AI temporarily unavailable" });

    const summary = safeStr(ai.data?.choices?.[0]?.message?.content, "Unable to generate summary.").slice(0, 1500);
    return json(200, {
      summary,
      citations: matches.map((m, i) => ({ index: i + 1, title: m.title, source: m.source })),
      guardrails: { rag_sources_used: matches.length, ai_retries: ai.retries, ai_latency_ms: ai.latencyMs },
    });
  } catch (e) {
    console.error("ai-vehicle-summary fatal", e);
    return json(500, { error: String(e instanceof Error ? e.message : e) });
  }
});
