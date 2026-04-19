// AutoServe AI Edge Function — handles 3 modes: chat, diagnose, valuate
// Uses Lovable AI Gateway (no key required, pre-configured via LOVABLE_API_KEY)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  chat: `You are AutoServe's expert AI service advisor for the Indian automotive market (Gurugram).
You have access to the customer's vehicles, bookings and service history (provided as context).
Speak in clear, friendly, concise English. Use ₹ for prices. Reference the customer's actual vehicles by name.
For maintenance recommendations, mention typical Indian garage rates. Keep responses under 200 words unless asked for detail.`,

  diagnose: `You are an expert Indian automotive diagnostic engineer. Given customer-reported symptoms and their vehicle, return a JSON array of the 3 most likely faults.
Each fault MUST have: { "fault": string, "detail": string (one-line explanation), "confidence": number 0-100, "recommended_service": string (matching one of the service catalogue names provided), "urgency": "low" | "medium" | "high" }.
Return ONLY the JSON array, no markdown, no preamble.`,

  valuate: `You are an expert used-car valuator for the Indian market (Gurugram/Delhi NCR, 2024 prices in ₹).
Given vehicle details, return ONLY a JSON object: { "estimated_value": number (₹), "low_estimate": number, "high_estimate": number, "confidence": number 0-100, "depreciation_pct_per_year": number, "narrative": string (2-3 sentences explaining the valuation, market trend, and condition impact), "tips": string[] (2 actionable tips to maximize resale value) }.
Use realistic Indian secondary-market pricing. No markdown, no preamble.`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { mode, messages, vehicle, symptoms, services_catalog } = await req.json();
    if (!mode || !SYSTEM_PROMPTS[mode]) {
      return new Response(JSON.stringify({ error: "Invalid mode" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Optionally enrich chat with the user's data
    let contextBlock = "";
    if (mode === "chat") {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const [{ data: vehicles }, { data: bookings }, { data: history }, { data: svcs }] = await Promise.all([
            supabase.from("vehicles").select("make, model, year, registration, mileage, fuel_type").eq("owner_id", user.id),
            supabase.from("bookings").select("scheduled_at, status, notes, total_cost, service_id").eq("customer_id", user.id).order("scheduled_at", { ascending: false }).limit(5),
            supabase.from("service_history").select("service_date, cost, mileage_at_service, notes, service_id").eq("customer_id", user.id).order("service_date", { ascending: false }).limit(5),
            supabase.from("services").select("id, name, price, category"),
          ]);
          const svcMap = new Map((svcs ?? []).map((s: any) => [s.id, s]));
          contextBlock = `\n\n--- CUSTOMER CONTEXT ---\nVehicles: ${JSON.stringify(vehicles ?? [])}\nRecent bookings: ${JSON.stringify((bookings ?? []).map((b: any) => ({ ...b, service: svcMap.get(b.service_id)?.name })))}\nService history: ${JSON.stringify((history ?? []).map((h: any) => ({ ...h, service: svcMap.get(h.service_id)?.name })))}\nAvailable services: ${JSON.stringify((svcs ?? []).map((s: any) => ({ name: s.name, price: s.price, category: s.category })))}\n--- END CONTEXT ---`;
        }
      }
    }

    let userContent = "";
    let chatMessages: any[] = [];

    if (mode === "chat") {
      chatMessages = [
        { role: "system", content: SYSTEM_PROMPTS.chat + contextBlock },
        ...(messages || []),
      ];
    } else if (mode === "diagnose") {
      userContent = `Vehicle: ${JSON.stringify(vehicle)}\nSymptoms: ${symptoms}\nAvailable services in catalogue: ${JSON.stringify(services_catalog ?? [])}`;
      chatMessages = [
        { role: "system", content: SYSTEM_PROMPTS.diagnose },
        { role: "user", content: userContent },
      ];
    } else if (mode === "valuate") {
      userContent = `Vehicle to valuate: ${JSON.stringify(vehicle)}`;
      chatMessages = [
        { role: "system", content: SYSTEM_PROMPTS.valuate },
        { role: "user", content: userContent },
      ];
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: chatMessages,
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!aiResp.ok) {
      const txt = await aiResp.text();
      throw new Error(`AI gateway error: ${aiResp.status} ${txt}`);
    }

    const data = await aiResp.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    // For diagnose/valuate, try to parse JSON
    if (mode === "diagnose" || mode === "valuate") {
      try {
        const cleaned = content.replace(/```json\s*|```\s*/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return new Response(JSON.stringify({ result: parsed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (_e) {
        return new Response(JSON.stringify({ error: "AI returned malformed JSON", raw: content }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("ai-assistant error:", err);
    return new Response(JSON.stringify({ error: err.message ?? String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
