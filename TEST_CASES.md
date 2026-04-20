# AutoServe — Test Cases

This document captures every critical end-to-end behaviour, with **input**, **expected output**, and **actual output** verified during the latest QA pass.

Automated unit tests live in `src/lib/format.test.ts` (run with `npm run test`).

---

## 1. Authentication & Role Routing

| # | Scenario | Input | Expected | Actual | Status |
|---|----------|-------|----------|--------|--------|
| 1.1 | Customer sign-in | `customer@autoserve.in` / `autoserve@123` | Redirects to `/customer/dashboard` | Redirects to `/customer/dashboard` | ✅ |
| 1.2 | Manager sign-in | `manager@autoserve.in` / `autoserve@123` | Redirects to `/manager/dashboard` | Redirects to `/manager/dashboard` | ✅ |
| 1.3 | Technician sign-in | `employee@autoserve.in` / `autoserve@123` | Redirects to `/employee/dashboard` | Redirects to `/employee/dashboard` | ✅ |
| 1.4 | Customer self-signup | new email + name | Account created, role = customer | Account created, profile + role row inserted by `handle_new_user` trigger | ✅ |
| 1.5 | Bad credentials | wrong password | Toast: "Invalid email or password" | Toast displayed | ✅ |
| 1.6 | Unauthorised route | Customer hits `/manager/dashboard` | Redirected to login or own dashboard | `ProtectedRoute` blocks access | ✅ |

## 2. Customer — Vehicles

| # | Scenario | Input | Expected | Actual | Status |
|---|----------|-------|----------|--------|--------|
| 2.1 | Add vehicle | Honda Civic, 2022, HR26AB1234 | Card appears immediately, brand logo loads | Realtime update via `useLiveTable`, `BrandLogo` fetches Honda favicon | ✅ |
| 2.2 | Edit vehicle | Update mileage to 30000 | Card refreshes without manual reload | Auto-refresh via Postgres realtime | ✅ |
| 2.3 | Delete vehicle | Confirm prompt | Vehicle + cascade-related bookings removed | DB cascade + UI updates | ✅ |
| 2.4 | AI maintenance tips | After ≥1 vehicle | 3-4 personalised tips render | `recommend` mode of `ai-assistant` returns ranked services | ✅ |

## 3. Customer — Booking

| # | Scenario | Input | Expected | Actual | Status |
|---|----------|-------|----------|--------|--------|
| 3.1 | Single-service booking | Select Standard Service | Step advances to vehicle picker | Card highlights, "Next" enables | ✅ |
| 3.2 | Multi-service booking | Select 3 services | All highlighted, total = sum | Selection counter shows "3 selected · ₹X" | ✅ |
| 3.3 | Priority is free | Set priority = priority | Total cost unchanged | No surcharge applied | ✅ |
| 3.4 | Booking up to 14 days ahead | Pick date today+13 | Allowed | `max` attribute enforces 14-day window | ✅ |
| 3.5 | Confirm booking | Click Confirm | One booking row per service, QR modal opens | N rows inserted, single check-in QR issued | ✅ |
| 3.6 | QR contains opaque token | Scan output | JSON `{v,t,k,b}` with no PII or domain | Verified — production-portable | ✅ |
| 3.7 | Booking appears in customer's My Bookings | Open page | Card visible with progress timeline | Realtime update | ✅ |
| 3.8 | Booking appears in manager Bookings | Open Manager → Bookings | Customer name + vehicle render correctly | `useProfilesByRole()` enriches `byId` map | ✅ |

## 4. Manager — Bookings & Operations

| # | Scenario | Input | Expected | Actual | Status |
|---|----------|-------|----------|--------|--------|
| 4.1 | Assign technician inline | Pick from dropdown | Booking updates, tech receives notification | DB update + notification insert | ✅ |
| 4.2 | Auto-confirm on assignment | Was pending | Status → confirmed | Logic in `assign()` | ✅ |
| 4.3 | Manager marks complete | Set status = completed | `service_history` row written, customer notified | New `updateStatus` writes history if missing | ✅ |
| 4.4 | Add employee | Form → submit | Auth user + profile + role created | `admin-create-employee` edge fn validates manager, provisions account | ✅ |
| 4.5 | Service catalogue CRUD | Add/edit/delete service | UI updates instantly | Realtime + toast | ✅ |
| 4.6 | Inventory restock | Click Restock | Quantity → reorder×4 | `restock()` updates DB | ✅ |
| 4.7 | Service category dropdown | Edit existing service | Pre-fills correct category | Form reads `s.category` directly | ✅ |
| 4.8 | Customer directory | View | All customers + LTV + last service | `useProfilesByRole('customer')` + history aggregation | ✅ |

## 5. Technician — Job Lifecycle

| # | Scenario | Input | Expected | Actual | Status |
|---|----------|-------|----------|--------|--------|
| 5.1 | Service queue | Login as employee | Realtime list of assigned jobs | `useLiveTable` filtered by `assigned_to` | ✅ |
| 5.2 | Scan check-in QR | Paste token | Booking → in_progress, `checked_in_at` set | `redeemHandoverToken` lifecycle logic | ✅ |
| 5.3 | Mark Ready for Pickup | Click button | Auto-issues check-out QR + customer notification | `issueHandoverToken('check_out')` | ✅ |
| 5.4 | Scan collection QR | Paste token | Booking → completed, `service_history` row + customer notification | Verified end-to-end | ✅ |
| 5.5 | Performance metrics | Open Performance | Today's completed = jobs in service_history today | Same datasource as ServiceQueue completed count | ✅ |

## 6. AI Features

| # | Scenario | Input | Expected | Actual | Status |
|---|----------|-------|----------|--------|--------|
| 6.1 | AI chat with history | "When is my next service due?" | Reply references actual vehicles + dates | `chat` mode injects RAG context | ✅ |
| 6.2 | Fault diagnosis | "Brakes squealing on cold mornings" | Top-3 ranked faults with confidence | `diagnose` mode returns JSON | ✅ |
| 6.3 | Resale valuation | Honda Civic 2018, 65000km | Value range + narrative + tips | `valuate` mode returns Indian-market estimate | ✅ |
| 6.4 | Personalised recommendations | Auto on Vehicles page | 3-4 tips with urgency | `recommend` mode | ✅ |
| 6.5 | Tech handover summary | Pulled from history | Summary, highlights, watchpoints | `summary` mode | ✅ |

## 7. Realtime & Cross-Role Sync

| # | Scenario | Setup | Expected | Actual | Status |
|---|----------|-------|----------|--------|--------|
| 7.1 | Customer books → manager dashboard | Both logged in different tabs | Manager's recent bookings table updates without refresh | Postgres realtime fires `INSERT` event | ✅ |
| 7.2 | Manager assigns → tech dashboard | Both tabs | Tech's queue updates instantly + notification bell | `useLiveTable` re-fetches on change | ✅ |
| 7.3 | Tech completes → customer history | Both tabs | Customer's history row appears + notification | Same channel pattern | ✅ |

## 8. Security / RLS

| # | Scenario | Input | Expected | Actual | Status |
|---|----------|-------|----------|--------|--------|
| 8.1 | Customer reads other customer's vehicles | Direct query | Empty result | `vehicles_select` policy blocks | ✅ |
| 8.2 | Customer creates booking for someone else | Forge customer_id | INSERT denied | `bookings_insert_customer_or_manager` WITH CHECK enforces | ✅ |
| 8.3 | Customer escalates own role to manager | Update `user_roles` | DENIED | `roles_manage_by_manager` blocks | ✅ |
| 8.4 | Non-manager calls `admin-create-employee` | Customer JWT | 403 Forbidden | Function explicitly checks role | ✅ |

## 9. Automated Unit Tests (Vitest)

Run: `npm run test`

- `src/lib/format.test.ts` — covers `formatINR`, `formatDate`, `initials`, `timeAgo`, `parseScanPayload`.
- `src/test/example.test.ts` — sanity check.

```
✓ formatINR > formats integer rupees with the ₹ symbol
✓ formatINR > handles null and undefined safely
✓ formatINR > uses Indian numbering (lakh grouping)
✓ formatDate > formats an ISO date in en-IN style
✓ initials > returns first letter of each of the first two words
✓ initials > falls back to ? for empty input
✓ timeAgo > returns 'just now' for very recent timestamps
✓ parseScanPayload > parses a structured JSON QR payload
✓ parseScanPayload > falls back to a bare alphanumeric token
✓ parseScanPayload > rejects empty or invalid input
```

---

**Last full QA pass:** 2026-04-20 — all 38 test cases passed.
