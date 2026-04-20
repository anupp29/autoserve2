// Symptom-based AI diagnostic assistant + general chat mode for the customer AI Assistant.
// Body shapes:
//   Diagnostics: { symptoms: string, vehicle?: {...} }
//   Chat:        { mode: "chat", context?: {...}, history: [{role, content}, ...] }
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

    // ============ DIAGNOSTICS MODE ============
    const { symptoms, vehicle } = body;
    if (!symptoms) return json(400, { error: "symptoms required" });

    const { data: services } = await admin.from("services").select("id, name, category, price").eq("active", true);
    const catalog = (services ?? []).map((s: any) => `${s.name} [${s.category}] – ₹${s.price}`).join("\n");

    const vehInfo = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.fuel_type ?? "Petrol"}, ${vehicle.mileage} km)` : "Unknown vehicle";
    const prompt = `Vehicle: ${vehInfo}
Customer's symptoms: ${symptoms}

Available services:
${catalog}

Return JSON:
{
  "probable_causes": ["2-4 short probable causes ranked by likelihood"],
  "severity": "low" | "medium" | "high",
  "recommended_service_names": ["1-3 services from the catalogue above to fix this"],
  "advice": "2-3 sentences of plain-English advice for the customer."
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an experienced automotive diagnostic technician. Output valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429) return json(429, { error: "Rate limited" });
    if (aiRes.status === 402) return json(402, { error: "AI credits exhausted" });
    if (!aiRes.ok) return json(500, { error: `AI error ${aiRes.status}` });

    const data = await aiRes.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch { return json(500, { error: "Invalid AI response" }); }

    const recIds = (parsed.recommended_service_names ?? [])
      .map((n: string) => services?.find((s: any) => s.name.toLowerCase() === String(n).toLowerCase())?.id)
      .filter(Boolean);

    return json(200, { ...parsed, recommended_service_ids: recIds });
  } catch (e) {
    console.error(e);
    return json(500, { error: String(e) });
  }
});

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
