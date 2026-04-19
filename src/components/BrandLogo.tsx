import { useState } from "react";
import { Car } from "lucide-react";
import { brandLogoUrl } from "@/lib/brandLogo";

interface BrandLogoProps {
  make: string | null | undefined;
  size?: number;
  className?: string;
}

/**
 * Renders a vehicle make logo. Falls back to a Car icon if the image fails to load.
 */
const BrandLogo = ({ make, size = 36, className = "" }: BrandLogoProps) => {
  const [errored, setErrored] = useState(false);
  const url = brandLogoUrl(make, size * 2);

  if (!make || errored) {
    return (
      <div
        className={`flex items-center justify-center bg-primary/10 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <Car className="text-primary" style={{ width: size * 0.55, height: size * 0.55 }} />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-white rounded-lg border border-border/30 overflow-hidden shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={url}
        alt={`${make} logo`}
        loading="lazy"
        onError={() => setErrored(true)}
        style={{ width: size * 0.7, height: size * 0.7, objectFit: "contain" }}
      />
    </div>
  );
};

export default BrandLogo;
