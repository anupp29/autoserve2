// admin-create-employee — Manager-only Edge Function to provision Employee accounts.
// JWT is validated in code (uses verify_jwt = true via global default; we re-verify role).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface CreateBody {
  email?: string;
  password?: string;
  full_name?: string;
  phone?: string;
  role?: "employee" | "manager";
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Missing Authorization header" }, 401);

    // 1. Verify caller and that they are a manager.
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: who, error: whoErr } = await userClient.auth.getUser();
    if (whoErr || !who.user) return json({ error: "Invalid session" }, 401);

    const { data: roles, error: roleErr } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", who.user.id);
    if (roleErr) return json({ error: roleErr.message }, 500);
    const isManager = (roles ?? []).some((r: { role: string }) => r.role === "manager");
    if (!isManager) return json({ error: "Only managers can create staff accounts" }, 403);

    // 2. Validate input
    const body = (await req.json().catch(() => ({}))) as CreateBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const fullName = body.full_name?.trim() ?? "";
    const phone = body.phone?.trim() ?? null;
    const role = body.role ?? "employee";
    if (!email || !email.includes("@")) return json({ error: "Valid email is required" }, 400);
    if (password.length < 8) return json({ error: "Password must be at least 8 characters" }, 400);
    if (!fullName) return json({ error: "Full name is required" }, 400);
    if (role !== "employee" && role !== "manager") return json({ error: "Invalid role" }, 400);

    // 3. Provision via admin client
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Check duplicate
    const { data: existing } = await admin.auth.admin.listUsers();
    if (existing?.users.find((u) => u.email?.toLowerCase() === email)) {
      return json({ error: "An account with this email already exists" }, 409);
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone, role },
    });
    if (createErr || !created.user) return json({ error: createErr?.message ?? "Could not create user" }, 500);

    const newUserId = created.user.id;

    // Profile + role (handle_new_user trigger may already create defaults; we upsert to be safe)
    await admin.from("profiles").upsert({ user_id: newUserId, full_name: fullName, phone }, { onConflict: "user_id" });
    await admin.from("user_roles").delete().eq("user_id", newUserId);
    await admin.from("user_roles").insert({ user_id: newUserId, role });

    return json({ ok: true, user_id: newUserId, email, role });
  } catch (e) {
    console.error("admin-create-employee error", e);
    return json({ error: String(e instanceof Error ? e.message : e) }, 500);
  }
});
