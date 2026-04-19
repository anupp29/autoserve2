// Estimates resale value of a vehicle using Lovable AI Gateway, calibrated to Indian used-car market.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { make, model, year, mileage, fuel_type, condition } = await req.json();
    if (!make || !model || !year) return json(400, { error: "make, model, year required" });

    const prompt = `Estimate the current 2025 resale value (in INR) of this car in the Indian used-car market (Gurugram/NCR):

- Make: ${make}
- Model: ${model}
- Year: ${year}
- Mileage: ${mileage ?? "unknown"} km
- Fuel: ${fuel_type ?? "Petrol"}
- Condition: ${condition ?? "Good"}

Return JSON:
{
  "estimated_value_inr": <number>,
  "low_inr": <number>,
  "high_inr": <number>,
  "depreciation_pct": <number 0-100>,
  "factors": ["3 short factors influencing the price"],
  "narrative": "2 sentences explaining the valuation in plain English."
}

Use realistic Indian used-car dealer prices (CarDekho, OLX, Cars24 averages). Be conservative.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an automotive valuation expert specialising in the Indian used-car market. Output valid JSON only." },
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

    return json(200, parsed);
  } catch (e) {
    console.error(e);
    return json(500, { error: String(e) });
  }
});

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
