# AutoServe — End-to-End Garage Operations Platform

AutoServe is a production-ready, role-based service management platform built for the Indian multi-brand independent garage market (Delhi NCR / Gurugram). It connects three personas — **Customers**, **Technicians**, and **Managers** — through a single realtime backend with QR-based vehicle handover, AI-powered diagnostics, and personalised maintenance recommendations.

## Live Accounts (seeded)

| Role        | Email                       | Password         |
|-------------|-----------------------------|------------------|
| Manager     | manager@autoserve.in        | autoserve@123    |
| Technician  | employee@autoserve.in       | autoserve@123    |
| Customer    | customer@autoserve.in       | autoserve@123    |

Customer self-signup is open at `/login`. Manager and Technician accounts are provisioned by an existing manager from **Manager → Employees → Add Employee** (calls a secure `admin-create-employee` edge function).

## Tech Stack

- **Frontend**: React 18, Vite 5, TypeScript 5, Tailwind CSS, shadcn/ui, Framer-style animations via Tailwind, lucide icons.
- **Backend**: Lovable Cloud (Supabase) — Postgres with RLS, Auth, Edge Functions, Realtime channels.
- **AI**: Lovable AI Gateway → `google/gemini-2.5-flash` (no API key needed).
- **Tests**: Vitest + React Testing Library + jsdom.

## Core Features

### Customer
- Multi-vehicle garage with brand logos auto-fetched per make.
- **Multi-service booking** (select N services in one booking) up to 14 days in advance.
- Free priority levels (normal / express / priority) — no surge pricing.
- **QR-based check-in** issued on confirmation.
- Live booking lifecycle timeline (Confirmed → Checked In → In Progress → Ready for Pickup → Released).
- **AI Assistant** with full RAG context over the customer's vehicles, bookings and history.
- **AI Diagnostics** — symptoms → ranked faults with confidence + one-click booking.
- **Resale Valuation** — Indian secondary-market pricing.
- **AI Maintenance Tips** on the Vehicles page — personalised recommendations.
- Service history with PDF/CSV export.

### Technician
- Realtime queue of assigned jobs (priority colour-coded).
- Scan handover QRs (camera via `BarcodeDetector` API + manual fallback).
- Job detail with notes, parts used, mileage capture.
- **Auto-issues collection QR** when job is marked Ready for Pickup.
- Service completion writes `service_history` row → drives Performance metrics.
- Performance dashboard: 7-day chart, completion rate, lifetime revenue.

### Manager
- Realtime operational dashboard with revenue/completion KPIs.
- Bookings table with inline status + technician assignment dropdowns (auto-records history on completion).
- **Add Employee** modal → secure edge function creates auth user + role row.
- Service catalogue, inventory monitor with restock action, customer directory, reports, scan handover.

### Realtime Everywhere
Every list view uses `useLiveTable` which subscribes to Postgres changes — no manual refresh needed after add/edit/delete.

## Database

All tables have **Row Level Security**. Customer can only see their own vehicles, bookings, history; staff can see everything; managers can mutate anything.

Tables: `profiles`, `user_roles`, `vehicles`, `services`, `inventory`, `bookings`, `service_history`, `notifications`, `handover_tokens`.

## Edge Functions

| Function                  | Purpose                                                        |
|---------------------------|----------------------------------------------------------------|
| `ai-assistant`            | 5 modes: chat / diagnose / valuate / recommend / summary       |
| `admin-create-employee`   | Manager-only staff provisioning                                |
| `seed-demo-accounts`      | Idempotent seeding of demo users + catalogue + customer data   |

## QR Handover Lifecycle

1. Customer books → check-in token issued, QR rendered.
2. Customer arrives → technician scans QR → booking moves to **In Progress**, vehicle is "locked" in service bay.
3. Technician finishes → marks **Ready for Pickup** → check-out token auto-issued + customer notified.
4. Customer arrives → presents collection QR → technician scans → booking **Completed**, `service_history` row written, vehicle "released".

Tokens are 32-char Crockford base32, stored server-side, scoped to a single booking, single-use, and expire in 7 days. The QR carries no PII so the same payload works on any domain (production-portable).

## Running Locally

```bash
npm install
npm run dev      # vite dev server
npm run test     # vitest run
npm run build    # production build
```

## Test Cases

See [`TEST_CASES.md`](./TEST_CASES.md) for the full input / expected / actual test matrix covering every critical user journey.

## Production Notes

- All routes are domain-portable — nothing hard-codes the Lovable preview URL.
- `supabase/functions/seed-demo-accounts` can be re-invoked safely; it upserts.
- To rotate a staff password, the manager simply re-creates the account (delete from Manager → Employees → re-add).

## License

Proprietary — AutoServe Precision Systems © 2026
