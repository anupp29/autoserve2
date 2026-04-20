# AutoServe — AI-Powered Automotive Service Management

Production-grade, three-portal automotive workshop platform tailored for the **Indian market** (₹ INR pricing, Maruti/Tata/Mahindra fleet, Gurugram operations).

Built on **React 18 + Vite + TypeScript + Tailwind**, backed by **Lovable Cloud** (Supabase: Postgres, Auth, RLS, Realtime, Edge Functions) and **Lovable AI Gateway** (Gemini 2.5 Flash).

---

## ✨ Highlights

| Capability | Detail |
|---|---|
| **3 Role-based portals** | Manager · Employee (Technician) · Customer — distinct sidebars, dashboards, RLS scopes |
| **End-to-end booking lifecycle** | `pending → confirmed → checked_in → in_progress → ready_for_pickup → completed → released` |
| **QR drop-off / pick-up** | Auto-generated `DROP-XXXXXXXX` and `PICK-XXXXXXXX` codes per booking + scanner page |
| **AI Assistant** | Conversational chat grounded in the customer's own vehicles + catalogue |
| **AI Diagnostics** | Symptom → probable cause → recommended service mapping |
| **AI Maintenance Tips** | Per-vehicle recommendations on the dashboard + vehicles page |
| **AI Vehicle History Summary** | Technician one-click brief on past work |
| **AI Resale Valuation** | Indian used-car market estimate (CarDekho/Cars24-calibrated) |
| **Multi-service bookings** | Pick several services, related-service suggestions, priority surcharge (Normal / Express +15% / Priority +30%) |
| **Auto service-history** | Database trigger creates `service_history` rows the moment a booking hits `completed`/`released` |
| **Realtime everything** | All CRUD updates propagate instantly via Supabase Realtime — no manual refresh |
| **Manager-issued staff accounts** | Managers create employees via `admin-create-employee` edge function (customers self-signup only) |

---

## 🔐 Default Demo Accounts

| Role | Email | Password |
|---|---|---|
| Manager | `manager@autoserve.in` | `autoserve@123` |
| Employee | `employee@autoserve.in` | `autoserve@123` |
| Customer | `customer@autoserve.in` | `autoserve@123` |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  React SPA (Vite)                                            │
│  ├ /manager/*    Bookings · Services · Inventory · Reports    │
│  ├ /employee/*   Queue · Job · Inventory · Performance        │
│  ├ /customer/*   Vehicles · Book · Bookings · AI Assistant    │
│  └ /staff/scan   Shared QR drop-off / pick-up scanner         │
└──────────────────────────────────────────────────────────────┘
                          │ supabase-js
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  Lovable Cloud  (Supabase Postgres + Auth + Storage + RT)    │
│  ├ tables       profiles · user_roles · vehicles · services   │
│  │              bookings · service_history · inventory ·      │
│  │              service_reminders · notifications             │
│  ├ enums        app_role · booking_status · booking_priority  │
│  ├ triggers     gen_booking_codes · create_history_on_completion │
│  ├ functions    has_role · get_user_role                      │
│  └ RLS          per-table, role-aware via has_role()          │
└──────────────────────────────────────────────────────────────┘
                          │ supabase.functions.invoke
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  Edge Functions  (Deno)                                       │
│  ├ admin-create-employee     manager-only staff provisioning  │
│  ├ ai-maintenance-tips       per-vehicle AI tips              │
│  ├ ai-diagnostics            symptom triage + chat mode       │
│  ├ ai-vehicle-summary        technician brief                 │
│  ├ ai-resale-valuation       Indian used-car valuation        │
│  └ seed-demo-accounts        seeds the 3 demo accounts        │
└──────────────────────────────────────────────────────────────┘
                          │ HTTPS
                          ▼
                   Lovable AI Gateway
                   (Google Gemini 2.5 Flash)
```

---

## 🗃️ Data Model (high-level)

| Table | Purpose | Key fields |
|---|---|---|
| `profiles` | Per-user display info | `user_id`, `full_name`, `phone` |
| `user_roles` | Role assignment (avoids privilege escalation) | `user_id`, `role` (`manager`/`employee`/`customer`) |
| `vehicles` | Customer vehicles | `owner_id`, `make`, `model`, `year`, `registration`, `mileage`, `fuel_type` |
| `services` | Service catalogue | `name`, `category`, `price`, `duration_minutes` |
| `bookings` | Lifecycle row | `customer_id`, `vehicle_id`, `service_id`, `extra_service_ids`, `assigned_to`, `status`, `priority`, `dropoff_code`, `pickup_code`, `total_cost` |
| `service_history` | Completed work log | `booking_id`, `technician_id`, `cost`, `parts_used` |
| `inventory` | Parts on hand | `sku`, `quantity`, `reorder_level` |
| `notifications` | In-app alerts | `user_id`, `title`, `message`, `read` |

All tables have **RLS enabled**. Role checks go through the `SECURITY DEFINER has_role()` function — no recursive policies.

---

## 🧪 Testing

```bash
npm test            # vitest run
```

Unit suites:

- `src/lib/format.test.ts` — currency, dates, time-ago, initials (10 cases)
- `src/lib/recommendations.test.ts` — related services, priority pricing (9 cases)
- `src/lib/brandLogos.test.ts` — Indian-brand logo resolution (5 cases)
- `src/lib/bookingLifecycle.test.ts` — status classification + total-cost math (10 cases)

**Total: 35 tests, all passing.** See [`TEST_CASES.md`](./TEST_CASES.md) for the full input → expected → actual matrix (including manual E2E steps and edge-function smoke tests).

---

## 🚀 Local Development

```bash
npm install
npm run dev         # http://localhost:8080
npm test            # vitest
```

Environment variables (`.env`, auto-managed):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Server-side secrets (managed in Lovable Cloud — never exposed to the browser):
- `SUPABASE_SERVICE_ROLE_KEY`
- `LOVABLE_API_KEY` (AI Gateway)

---

## 📜 Notable Constraints (from product memory)

- **Slate Precision** design system, industrial-mesh background, **Lucide icons only** (no emojis)
- All currency in **₹ INR** with Indian grouping (`1,25,000`)
- Brand list curated to the Indian market (Maruti Suzuki, Tata, Mahindra, Hyundai, …)
- No "Enterprise SSO" option — workshop tooling, not a SaaS gateway
- Custom AutoServe SVG logo — no platform branding ever shown

---

## 📈 Production Readiness Checklist

- ✅ RLS on all tables · linter clean · no recursive policies
- ✅ Unique role-aware sign-in (manager / employee / customer)
- ✅ All AI endpoints handle 429/402/error states gracefully
- ✅ Realtime subscriptions on every CRUD surface — zero manual refresh
- ✅ DB trigger guarantees `service_history` accuracy
- ✅ Mobile-responsive booking flow
- ✅ 35 passing unit tests
- ✅ Zero `console.error` in dev-server logs
