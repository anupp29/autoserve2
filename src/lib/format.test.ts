import { describe, it, expect } from "vitest";
import { formatINR, formatDate, formatTime, timeAgo, initials } from "@/lib/format";

describe("formatINR", () => {
  it("formats whole numbers with the rupee sign and Indian grouping", () => {
    expect(formatINR(2499)).toBe("₹2,499");
    expect(formatINR(125000)).toBe("₹1,25,000");
  });

  it("returns ₹0 for null or undefined", () => {
    expect(formatINR(null)).toBe("₹0");
    expect(formatINR(undefined)).toBe("₹0");
  });

  it("strips fractional rupees", () => {
    expect(formatINR(2499.75)).toBe("₹2,500");
  });
});

describe("formatDate", () => {
  it("formats an ISO string as DD-MMM-YYYY", () => {
    const out = formatDate("2026-04-19T10:00:00Z");
    expect(out).toMatch(/19 Apr 2026|20 Apr 2026/);
  });
});

describe("formatTime", () => {
  it("returns a string with hour and minute", () => {
    const out = formatTime("2026-04-19T10:30:00Z");
    expect(out).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("timeAgo", () => {
  it("returns 'just now' for the current moment", () => {
    expect(timeAgo(new Date())).toBe("just now");
  });

  it("returns minutes ago for recent past", () => {
    const fiveMin = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(fiveMin)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const twoHrs = new Date(Date.now() - 2 * 3600 * 1000);
    expect(timeAgo(twoHrs)).toBe("2h ago");
  });
});

describe("initials", () => {
  it("returns the first letter of up to two words", () => {
    expect(initials("Aarav Kapoor")).toBe("AK");
    expect(initials("Rohan")).toBe("R");
    expect(initials("Priya Mehta Verma")).toBe("PM");
  });

  it("returns ? for empty input", () => {
    expect(initials(null)).toBe("?");
    expect(initials("")).toBe("?");
    expect(initials("  ")).toBe("?");
  });
});
