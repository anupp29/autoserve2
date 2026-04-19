// Brand logo lookup via Carlogos / Wikipedia public CDN.
// Returns a stable URL for a vehicle make. Falls back to a domain-based logo lookup
// for makes not in the curated list. All sources are free / no-auth.

const SLUG_MAP: Record<string, string> = {
  "maruti suzuki": "suzuki",
  "maruti": "suzuki",
  "tata": "tata-motors",
  "mahindra": "mahindra",
  "hyundai": "hyundai",
  "honda": "honda",
  "toyota": "toyota",
  "kia": "kia",
  "mg": "mg-motor",
  "renault": "renault",
  "volkswagen": "volkswagen",
  "skoda": "skoda",
  "bmw": "bmw",
  "mercedes-benz": "mercedes-benz",
  "mercedes": "mercedes-benz",
  "audi": "audi",
  "ford": "ford",
  "nissan": "nissan",
  "jeep": "jeep",
  "volvo": "volvo",
  "porsche": "porsche",
  "lexus": "lexus",
};

const DOMAIN_MAP: Record<string, string> = {
  "maruti suzuki": "marutisuzuki.com",
  "maruti": "marutisuzuki.com",
  "tata": "tatamotors.com",
  "mahindra": "mahindra.com",
  "hyundai": "hyundai.com",
  "honda": "honda.com",
  "toyota": "toyota.com",
  "kia": "kia.com",
  "mg": "mgmotor.co.in",
  "renault": "renault.com",
  "volkswagen": "vw.com",
  "skoda": "skoda-auto.com",
  "bmw": "bmw.com",
  "mercedes-benz": "mercedes-benz.com",
  "mercedes": "mercedes-benz.com",
  "audi": "audi.com",
  "ford": "ford.com",
  "nissan": "nissan-global.com",
  "jeep": "jeep.com",
  "volvo": "volvocars.com",
  "porsche": "porsche.com",
  "lexus": "lexus.com",
};

/**
 * Returns a logo URL for a given vehicle make. Uses Google's favicon service which
 * works for any car maker domain and is rendered server-side (so no CORS issues).
 * Resolution 128 gives a crisp small logo.
 */
export const brandLogoUrl = (make: string | null | undefined, size = 128): string => {
  if (!make) return "";
  const key = make.toLowerCase().trim();
  const domain = DOMAIN_MAP[key] ?? `${key.replace(/\s+/g, "")}.com`;
  return `https://www.google.com/s2/favicons?sz=${size}&domain=${domain}`;
};

/** Pretty short label for badges */
export const brandSlug = (make: string | null | undefined): string => {
  if (!make) return "—";
  const key = make.toLowerCase().trim();
  return SLUG_MAP[key] ?? key;
};
