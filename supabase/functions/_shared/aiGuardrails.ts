// =====================================================================
// AutoServe AI Guardrails — production-grade safety, validation & RAG
// Used by ai-diagnostics, ai-maintenance-tips, ai-resale-valuation,
// ai-vehicle-summary edge functions.
// =====================================================================

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---------- 1. Input sanitisation & prompt-injection defence ----------

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/i,
  /disregard\s+(the\s+)?(system|previous|prior)/i,
  /you\s+are\s+now\s+(?:a|an)\s+\w+/i,
  /forget\s+(everything|all|previous)/i,
  /system\s*[:>]\s*you\s+are/i,
  /\bDAN\b\s+mode/i,
  /jailbreak/i,
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /print\s+(your\s+)?(system\s+)?(prompt|instructions)/i,
  /act\s+as\s+(?:a|an)\s+(?:different|another|new)/i,
];

const PII_PATTERNS: Array<{ name: string; pattern: RegExp; replace: string }> = [
  // Indian Aadhaar (12 digits, often grouped 4-4-4)
  { name: "aadhaar", pattern: /\b\d{4}\s?\d{4}\s?\d{4}\b/g, replace: "[AADHAAR-REDACTED]" },
  // PAN (5 letters + 4 digits + 1 letter)
  { name: "pan", pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/g, replace: "[PAN-REDACTED]" },
  // Credit card-ish (13–19 digits with optional spaces/dashes)
  { name: "card", pattern: /\b(?:\d[ -]*?){13,19}\b/g, replace: "[CARD-REDACTED]" },
  // Phone (Indian 10-digit, +91 optional)
  { name: "phone", pattern: /(?:\+?91[\s-]?)?[6-9]\d{9}\b/g, replace: "[PHONE-REDACTED]" },
];

export interface SanitiseResult {
  text: string;
  injectionDetected: boolean;
  redactedTypes: string[];
  truncated: boolean;
}

/**
 * Sanitises free-text user input for an LLM call:
 *  - Strips control characters
 *  - Truncates to a safe length
 *  - Detects (and softens) common prompt-injection phrases
 *  - Redacts obvious Indian PII (Aadhaar, PAN, phone, card)
 */
export function sanitiseUserText(raw: unknown, maxLen = 4000): SanitiseResult {
  const original = typeof raw === "string" ? raw : String(raw ?? "");
  // Strip null bytes and most control chars (keep \n, \r, \t)
  let text = original.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  const truncated = text.length > maxLen;
  if (truncated) text = text.slice(0, maxLen) + "…";

  let injectionDetected = false;
  for (const pat of INJECTION_PATTERNS) {
    if (pat.test(text)) {
      injectionDetected = true;
      // Neutralise by wrapping rather than deleting — keeps user intent visible
      text = text.replace(pat, "[blocked-instruction]");
    }
  }

  const redactedTypes: string[] = [];
  for (const { name, pattern, replace } of PII_PATTERNS) {
    if (pattern.test(text)) {
      redactedTypes.push(name);
      text = text.replace(pattern, replace);
    }
  }

  return { text, injectionDetected, redactedTypes, truncated };
}

// ---------- 2. Rate limiting (in-memory, per IP) ----------

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const ipBuckets = new Map<string, number[]>();

export function rateLimitOk(req: Request): { ok: boolean; retryAfter?: number } {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("cf-connecting-ip")
    || "anonymous";
  const now = Date.now();
  const bucket = (ipBuckets.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (bucket.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = bucket[0];
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000);
    return { ok: false, retryAfter };
  }
  bucket.push(now);
  ipBuckets.set(ip, bucket);
  return { ok: true };
}

// ---------- 3. Lovable AI gateway with retries + circuit breaker ----------

interface CallOptions {
  model?: string;
  messages: Array<{ role: string; content: string }>;
  responseFormat?: "json" | "text";
  tools?: any[];
  toolChoice?: any;
  maxRetries?: number;
  timeoutMs?: number;
}

export interface AiCallResult {
  ok: boolean;
  status: number;
  data?: any;
  error?: string;
  retries: number;
  latencyMs: number;
}

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";

/**
 * Calls Lovable AI Gateway with:
 *  - request timeout
 *  - exponential backoff on 429 / 5xx
 *  - explicit handling of 402 (no retry — credits exhausted)
 *  - latency + retry telemetry
 */
export async function callLovableAi(opts: CallOptions): Promise<AiCallResult> {
  const {
    model = "google/gemini-2.5-flash",
    messages,
    responseFormat,
    tools,
    toolChoice,
    maxRetries = 2,
    timeoutMs = 25_000,
  } = opts;

  const start = Date.now();
  let attempt = 0;
  let lastErr = "";
  let lastStatus = 0;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const body: any = { model, messages };
      if (responseFormat === "json") body.response_format = { type: "json_object" };
      if (tools) body.tools = tools;
      if (toolChoice) body.tool_choice = toolChoice;

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      lastStatus = res.status;

      // No retry on 402 (credits) — surface immediately
      if (res.status === 402) {
        return { ok: false, status: 402, error: "AI credits exhausted", retries: attempt, latencyMs: Date.now() - start };
      }

      if (res.status === 429) {
        lastErr = "Rate limited by upstream";
        // backoff
        await sleep(500 * Math.pow(2, attempt));
        attempt++;
        continue;
      }

      if (!res.ok) {
        lastErr = await res.text().catch(() => `HTTP ${res.status}`);
        if (res.status >= 500 && attempt < maxRetries) {
          await sleep(500 * Math.pow(2, attempt));
          attempt++;
          continue;
        }
        return { ok: false, status: res.status, error: lastErr, retries: attempt, latencyMs: Date.now() - start };
      }

      const data = await res.json();
      return { ok: true, status: 200, data, retries: attempt, latencyMs: Date.now() - start };
    } catch (e: any) {
      clearTimeout(timer);
      lastErr = e?.name === "AbortError" ? `Timeout after ${timeoutMs}ms` : String(e?.message ?? e);
      if (attempt < maxRetries) {
        await sleep(500 * Math.pow(2, attempt));
        attempt++;
        continue;
      }
      return { ok: false, status: lastStatus || 500, error: lastErr, retries: attempt, latencyMs: Date.now() - start };
    }
  }
  return { ok: false, status: lastStatus || 500, error: lastErr || "Unknown error", retries: attempt, latencyMs: Date.now() - start };
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

// ---------- 4. RAG retrieval helpers ----------

export interface KnowledgeEntry {
  id: string;
  category: string;
  title: string;
  body: string;
  keywords: string[];
  symptoms: string[];
  applies_to: string[];
  source: string;
}

/**
 * Lightweight keyword + symptom-overlap retrieval (no vector DB needed for this scale).
 * Returns the top-K entries scored by:
 *   - exact symptom phrase match (highest weight)
 *   - keyword overlap with query tokens
 *   - fuel-type relevance bonus
 */
export function retrieveKnowledge(
  query: string,
  entries: KnowledgeEntry[],
  opts: { fuelType?: string | null; topK?: number } = {},
): Array<KnowledgeEntry & { score: number; matchedOn: string[] }> {
  const { fuelType, topK = 4 } = opts;
  const q = query.toLowerCase();
  const tokens = new Set(
    q.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 2),
  );
  const fuel = (fuelType ?? "").toLowerCase();

  const scored = entries.map((e) => {
    let score = 0;
    const matchedOn: string[] = [];

    for (const sym of e.symptoms) {
      if (q.includes(sym.toLowerCase())) {
        score += 6;
        matchedOn.push(`symptom:${sym}`);
      }
    }
    for (const kw of e.keywords) {
      if (tokens.has(kw.toLowerCase())) {
        score += 2;
        matchedOn.push(`kw:${kw}`);
      }
    }
    // Fuel-type relevance
    const applies = e.applies_to.map((a) => a.toLowerCase());
    if (applies.includes("all") || (fuel && applies.includes(fuel))) {
      score += 1;
    } else if (fuel && applies.length > 0 && !applies.includes(fuel) && !applies.includes("all")) {
      score -= 3; // penalise irrelevant fuel-specific entries
    }

    return { ...e, score, matchedOn };
  });

  return scored
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/** Format retrieved knowledge into a compact prompt block with citations. */
export function formatKnowledgeForPrompt(matches: Array<KnowledgeEntry & { score: number }>): string {
  if (matches.length === 0) return "No specific knowledge-base entries matched. Reason from general automotive principles.";
  return matches.map((m, i) =>
    `[${i + 1}] (${m.category}) ${m.title}\n${m.body}\nSource: ${m.source}`,
  ).join("\n\n");
}

// ---------- 5. Output validators ----------

export function clamp(n: unknown, lo: number, hi: number, fallback: number): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(lo, Math.min(hi, Math.round(v)));
}

export function safeStr(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v.trim();
  if (v == null) return fallback;
  return String(v);
}

export function safeArray<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? v : [];
}

// ---------- 6. JSON response helper ----------

export function json(status: number, body: any, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}

// ---------- 7. Telemetry / structured logging ----------

export function logAiCall(meta: {
  function: string;
  userId?: string;
  injectionDetected?: boolean;
  redactedTypes?: string[];
  ragMatches?: number;
  ai: AiCallResult;
}) {
  const safeMeta = {
    fn: meta.function,
    user: meta.userId ? meta.userId.slice(0, 8) : "anon",
    inj: meta.injectionDetected ?? false,
    pii: meta.redactedTypes ?? [],
    rag: meta.ragMatches ?? 0,
    ai_ok: meta.ai.ok,
    ai_status: meta.ai.status,
    ai_retries: meta.ai.retries,
    ai_latency_ms: meta.ai.latencyMs,
    ai_err: meta.ai.error?.slice(0, 200),
  };
  console.log(JSON.stringify({ event: "ai_call", ...safeMeta }));
}
