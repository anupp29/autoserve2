import { describe, it, expect } from "vitest";
import { formatINR, formatDate, initials, timeAgo } from "@/lib/format";
import { parseScanPayload } from "@/lib/handover";

describe("formatINR", () => {
  it("formats integer rupees with the ₹ symbol", () => {
    expect(formatINR(1500)).toBe("₹1,500");
  });
  it("handles null and undefined safely", () => {
    expect(formatINR(null)).toBe("₹0");
    expect(formatINR(undefined)).toBe("₹0");
  });
  it("uses Indian numbering (lakh grouping)", () => {
    expect(formatINR(125000)).toBe("₹1,25,000");
  });
});

describe("formatDate", () => {
  it("formats an ISO date in en-IN style", () => {
    const out = formatDate("2026-04-19T10:00:00Z");
    expect(out).toMatch(/\d{2}/);
    expect(out).toMatch(/2026/);
  });
});

describe("initials", () => {
  it("returns first letter of each of the first two words", () => {
    expect(initials("Aarav Kapoor")).toBe("AK");
  });
  it("falls back to ? for empty input", () => {
    expect(initials(null)).toBe("?");
    expect(initials("")).toBe("?");
  });
});

describe("timeAgo", () => {
  it("returns 'just now' for very recent timestamps", () => {
    expect(timeAgo(new Date())).toBe("just now");
  });
});

describe("parseScanPayload", () => {
  it("parses a structured JSON QR payload", () => {
    const payload = JSON.stringify({ v: 1, t: "ABC123XYZ7890ABCDEF", k: "check_in", b: "boo-1" });
    const out = parseScanPayload(payload);
    expect(out?.token).toBe("ABC123XYZ7890ABCDEF");
    expect(out?.kind).toBe("check_in");
    expect(out?.bookingId).toBe("boo-1");
  });
  it("falls back to a bare alphanumeric token", () => {
    expect(parseScanPayload("ABCDEF1234567890")?.token).toBe("ABCDEF1234567890");
  });
  it("rejects empty or invalid input", () => {
    expect(parseScanPayload("")).toBeNull();
    expect(parseScanPayload("???")).toBeNull();
  });
});
