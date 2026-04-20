import { describe, it, expect } from "vitest";
import { brandLogoUrl, BRAND_LOGOS } from "@/lib/brandLogos";

describe("brandLogoUrl", () => {
  it("returns a CDN URL for known Indian makes", () => {
    expect(brandLogoUrl("Maruti Suzuki")).toMatch(/maruti-suzuki-logo/);
    expect(brandLogoUrl("Tata")).toMatch(/tata-logo/);
    expect(brandLogoUrl("Mahindra")).toMatch(/mahindra-logo/);
    expect(brandLogoUrl("Hyundai")).toMatch(/hyundai-logo/);
  });

  it("is case insensitive via fuzzy match", () => {
    expect(brandLogoUrl("maruti")).toBeTruthy();
    expect(brandLogoUrl("TATA MOTORS")).toBeTruthy();
    expect(brandLogoUrl("mercedes")).toMatch(/mercedes-benz-logo/);
  });

  it("returns null for unknown makes", () => {
    expect(brandLogoUrl("Unknown Make XYZ")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(brandLogoUrl(null)).toBeNull();
    expect(brandLogoUrl(undefined)).toBeNull();
    expect(brandLogoUrl("")).toBeNull();
  });

  it("covers all popular Indian-market brands", () => {
    const required = ["Maruti Suzuki", "Tata", "Mahindra", "Hyundai", "Honda", "Toyota", "Kia"];
    required.forEach((m) => expect(BRAND_LOGOS[m]).toBeDefined());
  });
});
