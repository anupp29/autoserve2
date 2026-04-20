import { describe, it, expect } from "vitest";
import { recommendRelated, PRIORITY_MULTIPLIER, priorityLabel, RELATED_BY_CATEGORY } from "@/lib/recommendations";

const catalog = [
  { id: "1", name: "Basic Service", category: "Maintenance", price: 2499 },
  { id: "2", name: "Diagnostic Scan", category: "Diagnostics", price: 599 },
  { id: "3", name: "Wheel Alignment", category: "Tyres", price: 799 },
  { id: "4", name: "AC Service", category: "AC", price: 1899 },
  { id: "5", name: "Engine Tuning", category: "Engine", price: 4999 },
  { id: "6", name: "Brake Pads", category: "Brakes", price: 3499 },
];

describe("recommendRelated", () => {
  it("returns related categories for a Maintenance pick", () => {
    const picked = catalog[0];
    const recs = recommendRelated(picked, catalog, new Set([picked.id]), 3);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(3);
    // Should not include the picked service
    expect(recs.find((r) => r.id === picked.id)).toBeUndefined();
    // Recommended categories must come from the related-map
    const allowed = new Set([...(RELATED_BY_CATEGORY["Maintenance"] ?? []), "Maintenance"]);
    recs.forEach((r) => expect(allowed.has(r.category)).toBe(true));
  });

  it("excludes already-selected services", () => {
    const picked = catalog[0];
    const selected = new Set([picked.id, catalog[1].id, catalog[2].id]);
    const recs = recommendRelated(picked, catalog, selected, 3);
    recs.forEach((r) => expect(selected.has(r.id)).toBe(false));
  });

  it("returns an empty list when no service is picked", () => {
    expect(recommendRelated(undefined, catalog, new Set())).toEqual([]);
  });

  it("recommends Brakes and Maintenance for a Tyres pick", () => {
    const picked = catalog[2]; // Wheel Alignment / Tyres
    const recs = recommendRelated(picked, catalog, new Set([picked.id]), 3);
    const cats = recs.map((r) => r.category);
    expect(cats.some((c) => ["Brakes", "Maintenance"].includes(c))).toBe(true);
  });
});

describe("PRIORITY_MULTIPLIER", () => {
  it("normal has no surcharge", () => expect(PRIORITY_MULTIPLIER.normal).toBe(1));
  it("express adds 15%", () => expect(PRIORITY_MULTIPLIER.express).toBeCloseTo(1.15));
  it("priority adds 30%", () => expect(PRIORITY_MULTIPLIER.priority).toBeCloseTo(1.3));

  it("computes correct surcharge for ₹10,000", () => {
    const base = 10000;
    expect(base * (PRIORITY_MULTIPLIER.express - 1)).toBeCloseTo(1500);
    expect(base * (PRIORITY_MULTIPLIER.priority - 1)).toBeCloseTo(3000);
  });
});

describe("priorityLabel", () => {
  it("returns labelled strings", () => {
    expect(priorityLabel("normal")).toBe("Normal");
    expect(priorityLabel("express")).toBe("Express (+15%)");
    expect(priorityLabel("priority")).toBe("Priority (+30%)");
  });
});
