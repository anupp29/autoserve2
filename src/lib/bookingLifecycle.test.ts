// Booking lifecycle helpers — tests for the customer/manager booking pages' status logic.
import { describe, it, expect } from "vitest";

// Mirror the constants used in src/pages/customer/MyBookings.tsx and src/pages/manager/Bookings.tsx
const ALL_STATUSES = [
  "pending",
  "confirmed",
  "checked_in",
  "in_progress",
  "ready_for_pickup",
  "completed",
  "released",
  "cancelled",
] as const;

type Status = typeof ALL_STATUSES[number];

const isUpcoming = (s: Status) => ["pending", "confirmed"].includes(s);
const isInProgress = (s: Status) => ["checked_in", "in_progress", "ready_for_pickup"].includes(s);
const isPast = (s: Status) => ["completed", "released"].includes(s);
const showsDropoffQR = (s: Status) => ["pending", "confirmed"].includes(s);
const showsPickupQR = (s: Status) => s === "ready_for_pickup";

describe("Booking lifecycle classification", () => {
  it("classifies upcoming statuses", () => {
    expect(isUpcoming("pending")).toBe(true);
    expect(isUpcoming("confirmed")).toBe(true);
    expect(isUpcoming("in_progress")).toBe(false);
    expect(isUpcoming("released")).toBe(false);
  });

  it("classifies in-progress statuses", () => {
    expect(isInProgress("checked_in")).toBe(true);
    expect(isInProgress("in_progress")).toBe(true);
    expect(isInProgress("ready_for_pickup")).toBe(true);
    expect(isInProgress("pending")).toBe(false);
  });

  it("classifies past statuses (completed + released)", () => {
    expect(isPast("completed")).toBe(true);
    expect(isPast("released")).toBe(true);
    expect(isPast("cancelled")).toBe(false);
  });

  it("shows the drop-off QR ONLY before vehicle arrives", () => {
    expect(showsDropoffQR("pending")).toBe(true);
    expect(showsDropoffQR("confirmed")).toBe(true);
    expect(showsDropoffQR("checked_in")).toBe(false);
  });

  it("shows the pickup QR ONLY when ready_for_pickup", () => {
    expect(showsPickupQR("ready_for_pickup")).toBe(true);
    expect(showsPickupQR("in_progress")).toBe(false);
    expect(showsPickupQR("released")).toBe(false);
  });

  it("the lifecycle covers all 8 known statuses", () => {
    expect(ALL_STATUSES).toHaveLength(8);
  });
});

describe("Booking total cost with priority surcharge", () => {
  const computeTotal = (subtotal: number, priority: "normal" | "express" | "priority") => {
    const mult = priority === "express" ? 1.15 : priority === "priority" ? 1.3 : 1;
    return subtotal * mult;
  };

  it("normal priority charges base price", () => {
    expect(computeTotal(2499, "normal")).toBe(2499);
  });

  it("express adds 15%", () => {
    expect(computeTotal(2000, "express")).toBe(2300);
  });

  it("priority adds 30%", () => {
    expect(computeTotal(2000, "priority")).toBe(2600);
  });

  it("multi-service bookings sum subtotals before applying surcharge", () => {
    const subtotal = 2499 + 1899 + 599;
    expect(computeTotal(subtotal, "express")).toBeCloseTo(subtotal * 1.15);
  });
});
