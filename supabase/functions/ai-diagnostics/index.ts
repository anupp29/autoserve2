// AI diagnostic + chat assistant for AutoServe.
// Modes:
//   diagnose (default): { mode?: "diagnose", symptoms, vehicle, catalog? }  → { faults, recommended_service_ids, proTip }
//   chat:               { mode: "chat", history, context? }                 → { reply }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();

    // ============ CHAT MODE ============
    if (body.mode === "chat") {
      const history: Array<{ role: string; content: string }> = Array.isArray(body.history) ? body.history : [];
      if (history.length === 0) return json(400, { error: "history required" });

      const ctx = body.context ?? {};
      const systemPrompt = `You are AutoServe AI, an expert assistant for an Indian car-service workshop.
Be concise, friendly, use Indian Rupees (₹). Suggest specific services from the catalogue when relevant.
You have read access to this customer's data:
${JSON.stringify(ctx, null, 2)}

Rules:
- Never invent services not in the catalogue.
- For booking requests, always tell the user to use the "Open booking page" link — do not pretend to book.
- Keep replies under 6 sentences unless the user asks for detail.`;

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: systemPrompt }, ...history],
        }),
      });

      if (aiRes.status === 429) return json(429, { error: "Rate limited" });
      if (aiRes.status === 402) return json(402, { error: "AI credits exhausted" });
      if (!aiRes.ok) return json(500, { error: `AI error ${aiRes.status}` });

      const data = await aiRes.json();
      const reply = data?.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
      return json(200, { reply });
    }

    // ============ DIAGNOSTICS MODE (default) ============
    const { symptoms, vehicle } = body;
    if (!symptoms) return json(400, { error: "symptoms required" });

    // Use catalog from request if provided, else fetch from DB
    let catalog: Array<{ id: string; name: string; category: string; price: number; description?: string | null }>;
    if (Array.isArray(body.catalog) && body.catalog.length > 0) {
      catalog = body.catalog;
    } else {
      const { data: services } = await admin.from("services").select("id, name, category, price, description").eq("active", true);
      catalog = (services ?? []) as any;
    }

    const catalogText = catalog.map((s) => `- ${s.id} | ${s.name} [${s.category}] – ₹${s.price}`).join("\n");
    const vehInfo = vehicle ? `${vehicle.year ?? "?"} ${vehicle.make ?? ""} ${vehicle.model ?? ""} (${vehicle.fuel_type ?? "Petrol"}, ${vehicle.mileage ?? "?"} km)` : "Unknown vehicle";

    const prompt = `Vehicle: ${vehInfo}
Customer's symptoms: ${symptoms}

Available services (use the IDs verbatim):
${catalogText}

Return STRICT JSON in exactly this shape:
{
  "faults": [
    { "name": "short fault name", "description": "1 sentence cause/explanation", "confidence": 80 }
  ],
  "recommended_service_ids": ["<service_id from list above>", "..."],
  "proTip": "One actionable sentence of advice for the customer."
}

Rules:
- 2 to 4 faults, ranked by likelihood (highest confidence first).
- confidence is an integer 0–100.
- recommended_service_ids must use ONLY ids from the list above; pick 1–3 most relevant.
- proTip should be plain English, friendly, and actionable.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an experienced automotive diagnostic technician for the Indian market. Output valid JSON only, exactly matching the requested schema." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429) return json(429, { error: "Rate limited" });
    if (aiRes.status === 402) return json(402, { error: "AI credits exhausted" });
    if (!aiRes.ok) {
      const text = await aiRes.text();
      console.error("AI error", aiRes.status, text);
      return json(500, { error: `AI error ${aiRes.status}` });
    }

    const data = await aiRes.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch { return json(500, { error: "Invalid AI response" }); }

    // Sanitise / coerce output to expected shape
    const faults = Array.isArray(parsed.faults)
      ? parsed.faults.map((f: any) => ({
          name: String(f.name ?? "Possible issue"),
          description: String(f.description ?? ""),
          confidence: Math.max(0, Math.min(100, Math.round(Number(f.confidence ?? 50)))),
        }))
      : [];

    const validIds = new Set(catalog.map((s) => s.id));
    const recommended_service_ids = Array.isArray(parsed.recommended_service_ids)
      ? parsed.recommended_service_ids.filter((id: any) => validIds.has(String(id)))
      : [];

    const proTip = String(parsed.proTip ?? parsed.advice ?? "Get this checked at the workshop soon.");

    return json(200, { faults, recommended_service_ids, proTip });
  } catch (e) {
    console.error(e);
    return json(500, { error: String(e) });
  }
});

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
