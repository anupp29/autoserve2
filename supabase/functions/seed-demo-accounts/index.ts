import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// NOTE: These credentials live ONLY in the database (auth.users) once seeded.
// They are not referenced anywhere in the frontend code.
const ACCOUNTS = [
  { email: "manager@autoserve.in",  password: "autoserve@123", role: "manager",  full_name: "Marcus Verma",  phone: "+91 98100 11111" },
  { email: "employee@autoserve.in", password: "autoserve@123", role: "employee", full_name: "Rohan Sharma",  phone: "+91 98100 22222" },
  { email: "customer@autoserve.in", password: "autoserve@123", role: "customer", full_name: "Aarav Kapoor",  phone: "+91 98100 33333" },
];

async function ensureUser(acc: typeof ACCOUNTS[0]) {
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users.find((u) => u.email === acc.email);
  let userId: string;

  if (existing) {
    userId = existing.id;
    await admin.auth.admin.updateUserById(userId, {
      password: acc.password,
      email_confirm: true,
      user_metadata: { full_name: acc.full_name, phone: acc.phone, role: acc.role },
    });
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: acc.email,
      password: acc.password,
      email_confirm: true,
      user_metadata: { full_name: acc.full_name, phone: acc.phone, role: acc.role },
    });
    if (error) throw error;
    userId = data.user!.id;
  }

  await admin.from("profiles").upsert(
    { user_id: userId, full_name: acc.full_name, phone: acc.phone },
    { onConflict: "user_id" }
  );
  await admin.from("user_roles").delete().eq("user_id", userId);
  await admin.from("user_roles").insert({ user_id: userId, role: acc.role });
  return userId;
}

// Real Delhi-NCR / Gurugram garage rates (multi-brand independent service centre, Apr 2026)
async function seedCatalog() {
  const services = [
    { name: "Diagnostic Scan",        category: "Diagnostics", description: "Full OBD-II scan with detailed health report and live data review", price: 599,  duration_minutes: 30 },
    { name: "Standard Service",       category: "Maintenance", description: "Engine oil & filter change, multi-point inspection (33 checks)",     price: 2499, duration_minutes: 90 },
    { name: "Premium Service",        category: "Maintenance", description: "Full synthetic oil, all filters, brake & AC inspection, top-ups",   price: 4999, duration_minutes: 150 },
    { name: "Brake Service",          category: "Repair",      description: "Front pad replacement, rotor inspection, brake fluid flush",         price: 3499, duration_minutes: 120 },
    { name: "AC Service",             category: "Comfort",     description: "AC gas top-up (R-134a), condenser clean, evaporator check",          price: 1799, duration_minutes: 75 },
    { name: "Wheel Alignment & Balance", category: "Tyres",    description: "Computerised 4-wheel alignment + dynamic wheel balancing",           price: 999,  duration_minutes: 45 },
    { name: "Battery Replacement",    category: "Electrical",  description: "Battery health test + replacement (60-month warranty options)",      price: 5499, duration_minutes: 30 },
    { name: "Detailing & Wash",       category: "Cleaning",    description: "Premium foam wash, interior vacuum, dashboard polish, tyre dressing", price: 1299, duration_minutes: 90 },
    { name: "Clutch Overhaul",        category: "Repair",      description: "Clutch plate, pressure plate & release bearing replacement",         price: 8999, duration_minutes: 240 },
    { name: "Suspension Inspection",  category: "Repair",      description: "Strut, shock & bush inspection with road-test report",               price: 799,  duration_minutes: 60 },
  ];

  await admin.from("handover_tokens").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("bookings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("service_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("services").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: svcErr } = await admin.from("services").insert(services);
  if (svcErr) console.error("services insert error:", svcErr);

  // Real Indian aftermarket parts pricing
  const inventory = [
    { sku: "OIL-5W30-1L",   name: "Engine Oil 5W-30 (1L)",          category: "Lubricants",  quantity: 84, reorder_level: 20, unit_price: 580,  supplier: "Castrol India" },
    { sku: "OIL-FLT-MRT",   name: "Oil Filter (Maruti)",            category: "Filters",     quantity: 45, reorder_level: 15, unit_price: 280,  supplier: "Bosch" },
    { sku: "AIR-FLT-TAT",   name: "Air Filter (Tata)",              category: "Filters",     quantity: 8,  reorder_level: 15, unit_price: 420,  supplier: "MANN" },
    { sku: "BRK-PAD-FRT",   name: "Front Brake Pads (set)",         category: "Brakes",      quantity: 32, reorder_level: 10, unit_price: 1450, supplier: "Brembo" },
    { sku: "BRK-PAD-RR",    name: "Rear Brake Pads (set)",          category: "Brakes",      quantity: 28, reorder_level: 10, unit_price: 1250, supplier: "Brembo" },
    { sku: "BAT-12V-65",    name: "Battery 12V 65Ah",               category: "Electrical",  quantity: 12, reorder_level: 5,  unit_price: 5200, supplier: "Exide" },
    { sku: "WIPER-22",      name: 'Wiper Blade 22"',                category: "Accessories", quantity: 56, reorder_level: 20, unit_price: 380,  supplier: "Bosch" },
    { sku: "AC-GAS-R134",   name: "AC Refrigerant R-134a (cyl)",    category: "AC",          quantity: 5,  reorder_level: 8,  unit_price: 1100, supplier: "Honeywell" },
    { sku: "COOLANT-1L",    name: "Engine Coolant (1L)",            category: "Fluids",      quantity: 38, reorder_level: 15, unit_price: 340,  supplier: "Castrol India" },
    { sku: "SPARK-PLUG-IRD",name: "Spark Plug (Iridium)",           category: "Engine",      quantity: 64, reorder_level: 20, unit_price: 620,  supplier: "NGK" },
    { sku: "BRAKE-FLUID",   name: "Brake Fluid DOT-4 (500ml)",      category: "Fluids",      quantity: 22, reorder_level: 10, unit_price: 290,  supplier: "Castrol India" },
    { sku: "CABIN-FLT",     name: "Cabin Air Filter",               category: "Filters",     quantity: 18, reorder_level: 12, unit_price: 380,  supplier: "MANN" },
  ];
  for (const i of inventory) {
    await admin.from("inventory").upsert(i, { onConflict: "sku" });
  }
}

async function seedCustomerData(customerId: string, employeeId: string) {
  const vehicles = [
    { owner_id: customerId, make: "Maruti Suzuki", model: "Swift VXi",     year: 2022, registration: "HR 26 BX 1234", color: "Pearl White",    mileage: 28450, fuel_type: "Petrol" },
    { owner_id: customerId, make: "Tata",          model: "Nexon EV",      year: 2023, registration: "DL 8C AB 9876", color: "Signature Teal", mileage: 14200, fuel_type: "Electric" },
    { owner_id: customerId, make: "Mahindra",      model: "XUV700 AX7",    year: 2024, registration: "HR 26 CD 5678", color: "Napoli Black",   mileage: 8900,  fuel_type: "Diesel" },
  ];

  await admin.from("handover_tokens").delete().eq("issued_to", customerId);
  await admin.from("bookings").delete().eq("customer_id", customerId);
  await admin.from("service_history").delete().eq("customer_id", customerId);
  await admin.from("vehicles").delete().eq("owner_id", customerId);

  const vehIds: string[] = [];
  for (const v of vehicles) {
    const { data, error } = await admin.from("vehicles").insert(v).select("id").single();
    if (error) { console.error("vehicle insert error", error); continue; }
    if (data) vehIds.push(data.id);
  }
  if (vehIds.length === 0) return;

  const { data: svcList } = await admin.from("services").select("id, name, price").order("price").limit(8);
  if (!svcList || vehIds.length === 0) return;

  const now = new Date();
  const futureDate = (days: number, hour = 10) => {
    const d = new Date(now); d.setDate(d.getDate() + days); d.setHours(hour, 0, 0, 0); return d.toISOString();
  };
  const pastDate = (days: number) => {
    const d = new Date(now); d.setDate(d.getDate() - days); return d.toISOString();
  };

  const bookings = [
    { customer_id: customerId, vehicle_id: vehIds[0], service_id: svcList[1].id, scheduled_at: futureDate(2, 10), status: "confirmed",  priority: "normal",   assigned_to: employeeId, total_cost: svcList[1].price },
    { customer_id: customerId, vehicle_id: vehIds[1], service_id: svcList[3].id, scheduled_at: futureDate(5, 14), status: "pending",    priority: "express",  total_cost: svcList[3].price },
    { customer_id: customerId, vehicle_id: vehIds[2], service_id: svcList[2].id, scheduled_at: futureDate(0, 11), status: "in_progress", priority: "priority", assigned_to: employeeId, total_cost: svcList[2].price },
    { customer_id: customerId, vehicle_id: vehIds[0], service_id: svcList[4].id, scheduled_at: futureDate(-3, 10), status: "completed", priority: "normal",  assigned_to: employeeId, total_cost: svcList[4].price },
  ];
  for (const b of bookings) await admin.from("bookings").insert(b);

  const history = [
    { customer_id: customerId, vehicle_id: vehIds[0], service_id: svcList[1].id, technician_id: employeeId, service_date: pastDate(45),  mileage_at_service: 26100, parts_used: "Engine oil 5W-30 (3.5L), Oil filter", notes: "Routine maintenance. All checks passed.",   cost: svcList[1].price },
    { customer_id: customerId, vehicle_id: vehIds[0], service_id: svcList[3].id, technician_id: employeeId, service_date: pastDate(120), mileage_at_service: 22300, parts_used: "Front brake pads, brake fluid",        notes: "Pads at 3mm, replaced. Rotors within spec.",  cost: svcList[3].price },
    { customer_id: customerId, vehicle_id: vehIds[1], service_id: svcList[0].id, technician_id: employeeId, service_date: pastDate(30),  mileage_at_service: 13500, parts_used: "Diagnostic scan",                       notes: "EV systems healthy. Battery SoH 96%.",        cost: svcList[0].price },
    { customer_id: customerId, vehicle_id: vehIds[2], service_id: svcList[2].id, technician_id: employeeId, service_date: pastDate(60),  mileage_at_service: 6200,  parts_used: "Premium service kit",                   notes: "First major service done. Excellent condition.", cost: svcList[2].price },
  ];
  for (const h of history) await admin.from("service_history").insert(h);

  await admin.from("notifications").delete().eq("user_id", customerId);
  const notifs = [
    { user_id: customerId, title: "Booking Confirmed",  message: "Your Swift service is confirmed for the day after tomorrow at 10:00 AM.",   type: "success" },
    { user_id: customerId, title: "Service In Progress", message: "Your XUV700 is currently being serviced by our technician.",                type: "info" },
    { user_id: customerId, title: "Reminder",            message: "Your Nexon EV is due for a routine check next week.",                       type: "warning" },
  ];
  for (const n of notifs) await admin.from("notifications").insert(n);
}

async function seedStaffNotifications(managerId: string, employeeId: string) {
  await admin.from("notifications").delete().in("user_id", [managerId, employeeId]);
  await admin.from("notifications").insert([
    { user_id: managerId,  title: "Low Stock Alert", message: "Air Filter (Tata) and AC Refrigerant are below reorder level.",            type: "warning" },
    { user_id: managerId,  title: "New Booking",      message: "Aarav Kapoor booked an Express AC Service.",                              type: "info" },
    { user_id: managerId,  title: "Daily Report",     message: "Yesterday closed with ₹38,200 in completed services.",                    type: "success" },
    { user_id: employeeId, title: "Job Assigned",     message: "Premium Service for XUV700 (HR 26 CD 5678) is in your queue.",            type: "info" },
    { user_id: employeeId, title: "Priority Job",     message: "Mark XUV700 service as priority — customer waiting on premises.",         type: "warning" },
  ]);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ids: Record<string, string> = {};
    for (const acc of ACCOUNTS) {
      ids[acc.role] = await ensureUser(acc);
    }
    await seedCatalog();
    await seedCustomerData(ids.customer, ids.employee);
    await seedStaffNotifications(ids.manager, ids.employee);

    return new Response(
      JSON.stringify({ success: true, accounts: ACCOUNTS.map((a) => ({ email: a.email, role: a.role })), ids }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("seed error", e);
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
