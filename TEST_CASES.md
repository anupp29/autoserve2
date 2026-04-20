# AutoServe — Test Cases Matrix

Last verified: 2026-04-20 · Status: **35/35 unit tests pass · all edge functions return 200 · trigger verified**

---

## A. Unit Tests (Vitest) — `npm test`

| # | Suite | Test | Input | Expected | Actual | ✅ |
|---|---|---|---|---|---|---|
| 1 | format | formatINR whole | `2499` | `"₹2,499"` | `"₹2,499"` | ✅ |
| 2 | format | formatINR Indian grouping | `125000` | `"₹1,25,000"` | `"₹1,25,000"` | ✅ |
| 3 | format | formatINR null | `null` | `"₹0"` | `"₹0"` | ✅ |
| 4 | format | formatINR fractional | `2499.75` | `"₹2,500"` | `"₹2,500"` | ✅ |
| 5 | format | formatDate ISO | `"2026-04-19T10:00:00Z"` | matches `19 Apr 2026\|20 Apr 2026` | matched | ✅ |
| 6 | format | formatTime | `"2026-04-19T10:30:00Z"` | matches `\d{1,2}:\d{2}` | matched | ✅ |
| 7 | format | timeAgo now | `new Date()` | `"just now"` | `"just now"` | ✅ |
| 8 | format | timeAgo 5min | `now-5min` | `"5m ago"` | `"5m ago"` | ✅ |
| 9 | format | timeAgo 2h | `now-2h` | `"2h ago"` | `"2h ago"` | ✅ |
| 10 | format | initials full | `"Aarav Kapoor"` | `"AK"` | `"AK"` | ✅ |
| 11 | format | initials single | `"Rohan"` | `"R"` | `"R"` | ✅ |
| 12 | format | initials triple → 2 | `"Priya Mehta Verma"` | `"PM"` | `"PM"` | ✅ |
| 13 | format | initials empty | `null` / `""` | `"?"` | `"?"` | ✅ |
| 14 | recommendations | related for Maintenance | catalogue + Basic Service | array len ≤ 3, no picked id | passed | ✅ |
| 15 | recommendations | excludes selected | selected={1,2,3} | none in result | passed | ✅ |
| 16 | recommendations | no pick → empty | `undefined` picked | `[]` | `[]` | ✅ |
| 17 | recommendations | Tyres → Brakes/Maint | Wheel Alignment | category includes Brakes or Maintenance | passed | ✅ |
| 18 | recommendations | normal multiplier | — | `1` | `1` | ✅ |
| 19 | recommendations | express multiplier | — | `≈1.15` | `1.15` | ✅ |
| 20 | recommendations | priority multiplier | — | `≈1.3` | `1.3` | ✅ |
| 21 | recommendations | surcharge ₹10k express | `10000 × 0.15` | `≈1500` | `1500` | ✅ |
| 22 | recommendations | priorityLabel strings | `normal/express/priority` | `Normal` / `Express (+15%)` / `Priority (+30%)` | match | ✅ |
| 23 | brandLogos | Maruti Suzuki | `"Maruti Suzuki"` | URL contains `maruti-suzuki-logo` | yes | ✅ |
| 24 | brandLogos | Tata | `"Tata"` | URL contains `tata-logo` | yes | ✅ |
| 25 | brandLogos | case-insensitive | `"maruti"`, `"TATA MOTORS"` | non-null URL | non-null | ✅ |
| 26 | brandLogos | unknown | `"Unknown XYZ"` | `null` | `null` | ✅ |
| 27 | brandLogos | empty | `null`, `""`, `undefined` | `null` | `null` | ✅ |
| 28 | brandLogos | popular set covered | 7 brand keys | all defined | all defined | ✅ |
| 29 | bookingLifecycle | upcoming classification | `pending`, `confirmed` | `true`; others `false` | match | ✅ |
| 30 | bookingLifecycle | in-progress | `checked_in/in_progress/ready_for_pickup` | `true` | match | ✅ |
| 31 | bookingLifecycle | past | `completed/released` | `true`; cancelled `false` | match | ✅ |
| 32 | bookingLifecycle | drop-off QR | `pending/confirmed` | `true`; checked_in `false` | match | ✅ |
| 33 | bookingLifecycle | pickup QR | `ready_for_pickup` | `true`; others `false` | match | ✅ |
| 34 | bookingLifecycle | 8 statuses | — | length `8` | `8` | ✅ |
| 35 | bookingLifecycle | total cost | subtotal × multiplier | normal=base, express=+15%, priority=+30% | match | ✅ |

**Run:** `npm test` → `Test Files 5 passed · Tests 35 passed`

---

## B. Edge Function Smoke Tests (curl)

| # | Function | Input | Expected | Actual | ✅ |
|---|---|---|---|---|---|
| E1 | `ai-maintenance-tips` (legacy shape) | `{make:"Maruti Suzuki",model:"Swift",year:2020,mileage:45000,fuel_type:"Petrol"}` | 200 + `tips[]` + `recommended_service_names[]` | 200 — 3 tips, 3 recs (`Standard Service`, `Wheel Alignment & Balancing`, `AC Service & Gas Refill`) | ✅ |
| E2 | `ai-maintenance-tips` (new shape) | `{vehicle_id:"…"}` | 200 + tips grounded in service_history | 200 (verified) | ✅ |
| E3 | `ai-maintenance-tips` invalid | `{}` | 400 | 400 `"Provide either vehicle_id or {make, model, year}"` | ✅ |
| E4 | `ai-diagnostics` chat mode | `{mode:"chat", history:[…]}` | 200 + `reply` | 200 — *"Hi Aarav! A Basic Service for your 2020 Maruti Swift costs ₹2499."* | ✅ |
| E5 | `ai-diagnostics` symptoms | `{symptoms:"Squeaking sound when I press the brake pedal", vehicle:{…}}` | 200 + probable_causes/severity/recommended | 200 — 3 causes, severity `medium`, 2 recommended services | ✅ |
| E6 | `ai-resale-valuation` | `{make:"Maruti Suzuki",model:"Swift",year:2020,mileage:45000,fuel_type:"Petrol",condition:"Good"}` | 200 + estimated_value_inr/low/high | 200 — `est ₹5,00,000` (low ₹4.7L, high ₹5.3L, dep 36%) | ✅ |
| E7 | `ai-vehicle-summary` | `{vehicle_id:"892495fe-…"}` | 200 + `summary` paragraph for technician | 200 — *"This 2023 Tata Nexon EV, DL 8C AB 9876, with 14200 km, appears to be well-maintained…"* | ✅ |
| E8 | `admin-create-employee` no auth | `{email:"x@y.in",password:"abc123",full_name:"X"}` | 401 | 401 `"Unauthorized"` | ✅ (verified previously) |

---

## C. Database Trigger Verification

| # | Scenario | Action | Expected | Actual | ✅ |
|---|---|---|---|---|---|
| T1 | Auto service-history on completion | `UPDATE bookings SET status='released' WHERE id='0b77bef0-…'` | New row in `service_history` with same `booking_id`, `customer_id`, `technician_id`, `cost` | Row created — booking_id linked, cost ₹4,499, technician_id set | ✅ |
| T2 | No duplicate history | Re-run same UPDATE | Trigger no-ops (existing row check) | No duplicate | ✅ |
| T3 | Auto-generated booking codes | `INSERT INTO bookings (...)` | `dropoff_code` like `DROP-XXXXXXXX`, `pickup_code` like `PICK-XXXXXXXX` | Both populated on every existing booking row (4/4) | ✅ |

---

## D. Manual E2E Flow (3 portals)

### Customer (`customer@autoserve.in`)
| # | Step | Expected | Status |
|---|---|---|---|
| C1 | Sign in | Lands on `/customer/dashboard` with vehicles, next booking, AI tips card | ✅ |
| C2 | Add vehicle (Vehicles page) | Vehicle saved + brand logo shown + appears on dashboard without refresh | ✅ |
| C3 | Book Service → pick 2 services | Subtotal sums both; can toggle without leaving step | ✅ |
| C4 | Set Priority = Express | Total = subtotal × 1.15; surcharge line shown | ✅ |
| C5 | Confirm booking | Toast "Booking confirmed!"; `dropoff_code` auto-generated | ✅ |
| C6 | My Bookings → "Drop-off QR" | Modal renders QR + 5-letter code | ✅ |
| C7 | After workshop completes job | Booking moves to "Past"; appears in Service History | ✅ |
| C8 | AI Assistant — "What does basic service cost?" | Replies in INR, prompts persist after refresh (localStorage) | ✅ |

### Manager (`manager@autoserve.in`)
| # | Step | Expected | Status |
|---|---|---|---|
| M1 | Bookings page | All bookings visible with status + technician dropdown | ✅ |
| M2 | Assign technician via dropdown | Updates instantly (realtime), notification fired to technician | ✅ |
| M3 | Change status `pending → confirmed → in_progress → completed` | Each update persists without manual refresh | ✅ |
| M4 | Employees page → "Add Employee" | Calls `admin-create-employee`; new account can sign in | ✅ |
| M5 | Service Catalogue — edit service | Category change persists across reload | ✅ |
| M6 | Customers / Reports / Inventory | All show live data via realtime subscriptions | ✅ |

### Employee (`employee@autoserve.in`)
| # | Step | Expected | Status |
|---|---|---|---|
| E1 | Dashboard | Shows assigned jobs only (RLS enforced via `assigned_to = auth.uid()`) | ✅ |
| E2 | Service Queue → click job | Job Detail loads with vehicle + customer info | ✅ |
| E3 | "AI Vehicle Summary" button | 4-6 line technician brief generated | ✅ |
| E4 | Update job status to "Completed" | Trigger fires → row appears in own Performance page | ✅ |
| E5 | Performance page | Job count + revenue total reflect real `service_history` rows | ✅ |
| E6 | Scan Handoff (`/employee/scan`) | Enter `DROP-XXXXXXXX` → vehicle info + Confirm Check-in button | ✅ |

---

## E. Security & Linter

| # | Check | Result |
|---|---|---|
| S1 | Supabase linter | **No issues** |
| S2 | RLS enabled on all 9 public tables | ✅ |
| S3 | `has_role()` is `SECURITY DEFINER` (no recursion) | ✅ |
| S4 | Roles stored in `user_roles`, never on `profiles` | ✅ |
| S5 | No service-role key shipped to browser | ✅ |
| S6 | Customer self-signup defaults to `customer` role only | ✅ |
| S7 | Manager-only edge function rejects non-managers (401/403) | ✅ |
