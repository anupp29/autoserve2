// =====================================================================
// AI Resale Valuation — Indian used-car market estimate with guardrails
// Body: { vehicle: { make, model, year, mileage, fuel_type }, condition }
//       OR flat { make, model, year, mileage, fuel_type, condition }
// =====================================================================
import {
  corsHeaders, json, rateLimitOk, callLovableAi,
  clamp, safeArray, safeStr, logAiCall,
} from "../_shared/aiGuardrails.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const rl = rateLimitOk(req);
  if (!rl.ok) return json(429, { error: "Too many requests" }, { "Retry-After": String(rl.retryAfter ?? 30) });

  try {
    const body = await req.json();
    const v = body.vehicle ?? body;
    const make = safeStr(v.make);
    const model = safeStr(v.model);
    const year = Number(v.year);
    const mileage = Number(v.mileage);
    const fuel_type = safeStr(v.fuel_type, "Petrol");
    const condition = safeStr(body.condition ?? v.condition, "Good");
    const currentYear = new Date().getFullYear();

    if (!make || !model) return json(400, { error: "make, model required" });
    if (!Number.isInteger(year) || year < 1980 || year > currentYear + 1) {
      return json(400, { error: "year must be a valid model year" });
    }
    if (mileage != null && (mileage < 0 || mileage > 1_000_000)) {
      return json(400, { error: "mileage out of range" });
    }
    if (!["Fair", "Good", "Excellent", "Poor"].includes(condition)) {
      return json(400, { error: "condition must be Poor, Fair, Good or Excellent" });
    }

    const prompt = `Estimate the current ${currentYear} resale value (in INR) of this car in the Indian used-car market (Gurugram/NCR):

- Make: ${make}
- Model: ${model}
- Year: ${year}
- Mileage: ${mileage || "unknown"} km
- Fuel: ${fuel_type}
- Condition: ${condition}

Return STRICT JSON in this exact shape:
{
  "estimated_value": <integer rupees>,
  "base_value": <integer rupees, ex-showroom equivalent today>,
  "trend_pct": <number, recent 6-month price trend %, can be negative>,
  "confidence": <integer 0-100>,
  "insights": ["3 short positive market insights"],
  "warnings": ["1-2 short risks or caveats"],
  "depreciation": [
    { "months": 0, "value": <integer = estimated_value> },
    { "months": 6, "value": <integer> },
    { "months": 12, "value": <integer> },
    { "months": 24, "value": <integer> },
    { "months": 36, "value": <integer> }
  ]
}

Use realistic Indian used-car dealer prices (CarDekho / OLX / Cars24 averages). Be conservative.`;

    const ai = await callLovableAi({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an automotive valuation expert specialising in the Indian used-car market. Output valid JSON only, matching the requested schema exactly. Be conservative — overestimating frustrates customers." },
        { role: "user", content: prompt },
      ],
      responseFormat: "json",
    });
    logAiCall({ function: "ai-resale-valuation", ai });

    if (!ai.ok) return json(ai.status === 402 ? 402 : 503, { error: ai.error ?? "AI temporarily unavailable" });

    let parsed: any = {};
    const raw = ai.data?.choices?.[0]?.message?.content ?? "{}";
    try { parsed = JSON.parse(raw); } catch { return json(502, { error: "AI returned invalid JSON" }); }

    const estimated_value = Math.max(0, Math.round(Number(parsed.estimated_value ?? parsed.estimated_value_inr ?? 0)));
    const base_value = Math.max(estimated_value, Math.round(Number(parsed.base_value ?? estimated_value * 1.05)));
    const trend_pct = clamp(parsed.trend_pct, -50, 50, 0);
    const confidence = clamp(parsed.confidence, 0, 100, 75);
    const insights = safeArray<string>(parsed.insights).map((s) => safeStr(s).slice(0, 200)).filter(Boolean).slice(0, 5);
    const warnings = safeArray<string>(parsed.warnings).map((s) => safeStr(s).slice(0, 200)).filter(Boolean).slice(0, 3);

    let depreciation: Array<{ months: number; value: number }> = [];
    if (Array.isArray(parsed.depreciation) && parsed.depreciation.length > 0) {
      depreciation = parsed.depreciation
        .map((d: any) => ({
          months: Math.max(0, Math.round(Number(d.months ?? 0))),
          value: Math.max(0, Math.round(Number(d.value ?? 0))),
        }))
        .filter((d: { months: number; value: number }) => d.value > 0)
        .slice(0, 8);
    }
    if (depreciation.length === 0) {
      const annualDep = 0.12;
      depreciation = [0, 6, 12, 24, 36].map((m) => ({
        months: m,
        value: Math.round(estimated_value * Math.pow(1 - annualDep, m / 12)),
      }));
    }

    return json(200, {
      estimated_value, base_value, trend_pct, confidence,
      insights, warnings, depreciation,
      guardrails: { ai_retries: ai.retries, ai_latency_ms: ai.latencyMs },
    });
  } catch (e) {
    console.error("ai-resale-valuation fatal", e);
    return json(500, { error: String(e instanceof Error ? e.message : e) });
  }
});
