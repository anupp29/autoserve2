// AutoServe AI Edge Function — handles 5 modes: chat, diagnose, valuate, recommend, summary
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

  recommend: `You are AutoServe's intelligent service-recommendation engine for an Indian multi-brand garage.
Given a customer's vehicles, service history, and the available service catalogue, return ONLY a JSON array of 3-4 personalised recommendations.
Each item MUST have: { "service_name": string (must EXACTLY match a name from the catalogue), "reason": string (one short sentence — cite mileage interval, time since last service, or seasonal trigger), "urgency": "low" | "medium" | "high", "estimated_savings_or_benefit": string (e.g. "Avoids ₹15,000 brake rotor replacement") }.
Prioritise services the customer has NOT done recently. Consider typical Indian intervals (oil ~10,000 km, brake check ~20,000 km, AC ~12 months, battery ~3 years).
No markdown, no preamble.`,

  summary: `You are an expert Indian automotive technician's assistant.
Given a vehicle's prior service history, produce a concise technician handover briefing as JSON: { "summary": string (2-3 sentences highlighting maintenance pattern), "highlights": string[] (3-4 bullet facts: last major service, recurring issues, parts replaced), "watchpoints": string[] (2-3 things the technician should inspect next based on past notes), "next_due": string (one suggestion of what is likely due next, with mileage or time interval) }.
Keep it tactical and short. No markdown, no preamble.`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { mode, messages, vehicle, symptoms, services_catalog, history, customer_context } = await req.json();
    if (!mode || !SYSTEM_PROMPTS[mode]) {
      return new Response(JSON.stringify({ error: "Invalid mode" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Optionally enrich chat with the user's data
    let contextBlock = "";
    if (mode === "chat" || mode === "recommend") {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const [{ data: vehicles }, { data: bookings }, { data: hist }, { data: svcs }] = await Promise.all([
            supabase.from("vehicles").select("make, model, year, registration, mileage, fuel_type").eq("owner_id", user.id),
            supabase.from("bookings").select("scheduled_at, status, notes, total_cost, service_id").eq("customer_id", user.id).order("scheduled_at", { ascending: false }).limit(8),
            supabase.from("service_history").select("service_date, cost, mileage_at_service, notes, service_id").eq("customer_id", user.id).order("service_date", { ascending: false }).limit(10),
            supabase.from("services").select("id, name, price, category").eq("active", true),
          ]);
          const svcMap = new Map((svcs ?? []).map((s: { id: string; name: string }) => [s.id, s]));
          contextBlock = `\n\n--- CUSTOMER CONTEXT ---\nVehicles: ${JSON.stringify(vehicles ?? [])}\nRecent bookings: ${JSON.stringify((bookings ?? []).map((b: { service_id: string }) => ({ ...b, service: (svcMap.get(b.service_id) as { name?: string } | undefined)?.name })))}\nService history: ${JSON.stringify((hist ?? []).map((h: { service_id: string }) => ({ ...h, service: (svcMap.get(h.service_id) as { name?: string } | undefined)?.name })))}\nAvailable services: ${JSON.stringify((svcs ?? []).map((s: { name: string; price: number; category: string }) => ({ name: s.name, price: s.price, category: s.category })))}\n--- END CONTEXT ---`;
        }
      }
    }

    let userContent = "";
    let chatMessages: { role: string; content: string }[] = [];

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
    } else if (mode === "recommend") {
      const explicit = customer_context ? `\nExplicit context provided by app: ${JSON.stringify(customer_context)}` : "";
      chatMessages = [
        { role: "system", content: SYSTEM_PROMPTS.recommend + contextBlock + explicit },
        { role: "user", content: "Generate the personalised recommendations now." },
      ];
    } else if (mode === "summary") {
      userContent = `Vehicle: ${JSON.stringify(vehicle)}\nService history (most recent first): ${JSON.stringify(history ?? [])}`;
      chatMessages = [
        { role: "system", content: SYSTEM_PROMPTS.summary },
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

    // For modes that return JSON, try to parse
    if (mode === "diagnose" || mode === "valuate" || mode === "recommend" || mode === "summary") {
      try {
        const cleaned = content.replace(/```json\s*|```\s*/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return new Response(JSON.stringify({ result: parsed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (_e) {
        return new Response(JSON.stringify({ error: "AI returned malformed JSON", raw: content }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("ai-assistant error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
