// Returns AI maintenance tips + recommended services for a vehicle, based on its profile and history.
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
    const { vehicle_id } = await req.json();
    if (!vehicle_id) return json(400, { error: "vehicle_id required" });

    const [{ data: vehicle }, { data: history }, { data: services }] = await Promise.all([
      admin.from("vehicles").select("*").eq("id", vehicle_id).maybeSingle(),
      admin.from("service_history").select("service_id, service_date, mileage_at_service").eq("vehicle_id", vehicle_id).order("service_date", { ascending: false }).limit(10),
      admin.from("services").select("id, name, category, price").eq("active", true),
    ]);
    if (!vehicle) return json(404, { error: "Vehicle not found" });

    const recentServices = (history ?? []).map((h: any) =>
      services?.find((s: any) => s.id === h.service_id)?.name || "Service"
    );
    const catalog = (services ?? []).map((s: any) => `${s.name} [${s.category}] – ₹${s.price}`).join("\n");

    const prompt = `Vehicle profile:
- ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.fuel_type ?? "Petrol"})
- Current mileage: ${vehicle.mileage} km
- Recent services: ${recentServices.length ? recentServices.join(", ") : "none recorded"}

Available services in our catalogue:
${catalog}

Return a JSON object with these exact fields:
{
  "tips": ["3 short, actionable maintenance tips specific to this vehicle's age, mileage, fuel type", "..."],
  "recommended_service_names": ["1-3 service names from the catalogue above that this customer should book next, ranked by importance"]
}

Important:
- recommended_service_names MUST be exact names from the catalogue.
- Skip services already done in the last 30 days unless mileage warrants.
- For EVs, never recommend oil/spark plug services.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert automotive maintenance advisor for Indian car owners. Always reply with valid JSON only, no preamble." },
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
    try { parsed = JSON.parse(raw); } catch { parsed = { tips: [raw], recommended_service_names: [] }; }

    // Map names back to service IDs from the catalogue
    const recIds = (parsed.recommended_service_names ?? [])
      .map((n: string) => services?.find((s: any) => s.name.toLowerCase() === String(n).toLowerCase())?.id)
      .filter(Boolean);

    return json(200, {
      tips: parsed.tips ?? [],
      recommended_service_ids: recIds,
      recommended_service_names: parsed.recommended_service_names ?? [],
    });
  } catch (e) {
    console.error(e);
    return json(500, { error: String(e) });
  }
});

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
