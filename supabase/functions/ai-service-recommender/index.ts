// =====================================================================
// AI Service Recommender — hybrid RAG + LLM ranking
//
// Input:  { vehicle, selected_service_ids, candidate_services, history? }
// Output: { recommendations: [{ id, reason, confidence }], guardrails }
//
// Strategy:
//  1. Pre-filter candidates by category-affinity & history gaps (deterministic)
//  2. Pull RAG snippets keyed off (vehicle, selected categories)
//  3. Ask Gemini to rank top 3 with reasoning, constrained to candidate IDs
//  4. Validate & whitelist IDs, clamp confidence, fall back to heuristic
// =====================================================================
import {
  corsHeaders, json, sanitiseUserText, rateLimitOk, callLovableAi,
  retrieveKnowledge, formatKnowledgeForPrompt, clamp, safeStr, safeArray,
  logAiCall, KnowledgeEntry,
} from "../_shared/aiGuardrails.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Category-affinity matrix (deterministic baseline)
const RELATED: Record<string, string[]> = {
  Maintenance: ["Diagnostics", "Cleaning", "Tyres", "AC", "Brakes"],
  Engine:      ["Diagnostics", "Maintenance", "Electrical"],
  Brakes:      ["Tyres", "Maintenance", "Inspection"],
  Tyres:       ["Brakes", "Maintenance"],
  Tires:       ["Brakes", "Maintenance"],
  Electrical:  ["Diagnostics", "AC"],
  AC:          ["Electrical", "Maintenance"],
  Repair:      ["Diagnostics", "Maintenance"],
  Diagnostics: ["Engine", "Electrical", "Maintenance"],
  Cleaning:    ["Maintenance"],
  Body:        ["Cleaning"],
  Inspection:  ["Maintenance", "Diagnostics"],
};

interface ServiceLite {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const rl = rateLimitOk(req);
  if (!rl.ok) return json(429, { error: "Too many requests, try again shortly." }, { "Retry-After": String(rl.retryAfter ?? 30) });

  try {
    const body = await req.json();
    const vehicle = body.vehicle ?? null;
    const selectedIds: string[] = safeArray<string>(body.selected_service_ids).map(String);
    const history: Array<{ service_name?: string; service_date?: string }> = safeArray(body.history);

    let candidates: ServiceLite[] = Array.isArray(body.candidate_services) && body.candidate_services.length > 0
      ? body.candidate_services
      : ((await admin.from("services").select("id, name, category, price, description").eq("active", true)).data ?? []) as ServiceLite[];

    if (selectedIds.length === 0 || candidates.length === 0) {
      return json(400, { error: "selected_service_ids and candidate_services required" });
    }

    const selectedSet = new Set(selectedIds);
    const selected = candidates.filter((c) => selectedSet.has(c.id));
    const pool = candidates.filter((c) => !selectedSet.has(c.id));

    // ---- 1. Deterministic shortlist ----
    const wantedCats = new Set<string>();
    for (const s of selected) {
      (RELATED[s.category] ?? []).forEach((c) => wantedCats.add(c));
      wantedCats.add(s.category);
    }
    const recentNames = new Set(history.map((h) => (h.service_name ?? "").toLowerCase()).filter(Boolean));
    const shortlist = pool
      .map((c) => {
        let score = 0;
        if (wantedCats.has(c.category)) score += 2;
        if (!recentNames.has(c.name.toLowerCase())) score += 1; // prefer something new
        if (c.price < 1500) score += 0.5; // small add-ons more attractive
        return { ...c, _score: score };
      })
      .filter((c) => c._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 8);

    if (shortlist.length === 0) {
      return json(200, { recommendations: [], guardrails: { rag_sources_used: 0, mode: "no-candidates" } });
    }

    // ---- 2. RAG: pull entries relevant to selected categories + vehicle fuel ----
    const ragQuery = `${selected.map((s) => `${s.name} ${s.category}`).join(" ")} ${vehicle?.make ?? ""} ${vehicle?.fuel_type ?? ""}`;
    const cleanQuery = sanitiseUserText(ragQuery, 500);
    const { data: kb } = await admin.from("automotive_knowledge").select("*");
    const matches = retrieveKnowledge(cleanQuery.text, (kb ?? []) as KnowledgeEntry[], {
      fuelType: vehicle?.fuel_type,
      topK: 3,
    });
    const knowledgeBlock = formatKnowledgeForPrompt(matches);

    // ---- 3. Ask Gemini to rank ----
    const vehInfo = vehicle
      ? `${vehicle.year ?? "?"} ${vehicle.make ?? ""} ${vehicle.model ?? ""} (${vehicle.fuel_type ?? "Petrol"}, ${vehicle.mileage ?? "?"} km)`
      : "Unknown vehicle";

    const histText = history.length > 0
      ? history.slice(0, 8).map((h) => `- ${h.service_name ?? "Service"} on ${h.service_date ?? "?"}`).join("\n")
      : "No prior service history.";

    const prompt = `Vehicle: ${vehInfo}

Customer just selected these services for their booking:
${selected.map((s) => `- ${s.name} (${s.category}) — ₹${s.price}`).join("\n")}

Recent service history:
${histText}

EXPERT KNOWLEDGE BASE (cite numerically when used):
${knowledgeBlock}

Candidate add-on services (use the IDs verbatim):
${shortlist.map((s) => `- ${s.id} | ${s.name} [${s.category}] – ₹${s.price}${s.description ? ` – ${s.description}` : ""}`).join("\n")}

Task: pick the 3 BEST add-on services to recommend together with what the customer already chose.
Bias toward services that:
 - Pair naturally (e.g. brake inspection with tyre rotation).
 - Are due based on the vehicle's likely mileage interval.
 - The customer hasn't recently had.
 - Are good value (don't blindly recommend the most expensive).

Return STRICT JSON:
{
  "recommendations": [
    { "id": "<service_id from candidates>", "reason": "1 short sentence in friendly Indian English", "confidence": 85 }
  ]
}

Rules:
- Exactly up to 3 items.
- Use ONLY ids from the candidate list. Never invent.
- confidence is integer 0–100.
- "reason" ≤ 18 words, customer-friendly, no jargon. Mention rupees only if relevant.`;

    const ai = await callLovableAi({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are AutoServe's service-bundling specialist. You output valid JSON only and never invent services." },
        { role: "user", content: prompt },
      ],
      responseFormat: "json",
    });
    logAiCall({ function: "ai-service-recommender", ragMatches: matches.length, ai });

    // Heuristic fallback if AI fails — return the top 3 from shortlist
    const fallback = () => shortlist.slice(0, 3).map((s) => ({
      id: s.id,
      reason: `Pairs well with ${selected[0]?.name ?? "your selection"}.`,
      confidence: 60,
    }));

    if (!ai.ok) {
      return json(200, {
        recommendations: fallback(),
        guardrails: { rag_sources_used: matches.length, mode: "fallback", ai_error: ai.error },
      });
    }

    let parsed: any = {};
    const raw = ai.data?.choices?.[0]?.message?.content ?? "{}";
    try { parsed = JSON.parse(raw); } catch {
      return json(200, { recommendations: fallback(), guardrails: { rag_sources_used: matches.length, mode: "fallback-bad-json" } });
    }

    const validIds = new Set(shortlist.map((s) => s.id));
    const recommendations = safeArray<any>(parsed.recommendations)
      .map((r) => ({
        id: safeStr(r.id),
        reason: safeStr(r.reason, "Recommended add-on for your service.").slice(0, 140),
        confidence: clamp(r.confidence, 0, 100, 70),
      }))
      .filter((r) => validIds.has(r.id))
      .slice(0, 3);

    return json(200, {
      recommendations: recommendations.length > 0 ? recommendations : fallback(),
      citations: matches.map((m, i) => ({ index: i + 1, title: m.title, source: m.source })),
      guardrails: {
        rag_sources_used: matches.length,
        ai_retries: ai.retries,
        ai_latency_ms: ai.latencyMs,
        shortlist_size: shortlist.length,
        mode: recommendations.length > 0 ? "ai" : "fallback-empty",
      },
    });
  } catch (e) {
    console.error("ai-service-recommender fatal", e);
    return json(500, { error: String(e instanceof Error ? e.message : e) });
  }
});
