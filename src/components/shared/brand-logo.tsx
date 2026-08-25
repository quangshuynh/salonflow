import Image from "next/image";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Square source artwork, trimmed of its transparent margin. */
const LOGO_SRC = "/brand/salonflow-logo.png";

type BrandLogoProps = {
  /**
   * Rendered size in pixels. The artwork is square, so a single value keeps
   * the aspect ratio intact.
   *
   * The logo carries its own wordmark, which only becomes legible at roughly
   * 56px and up. Below that it reads as an app icon, so compact placements
   * (navbar, sidebar) pair it with a separate text wordmark instead.
   */
  size?: number;
  className?: string;
  /**
   * Set when the logo sits beside a visible "SalonFlow" wordmark, so the
   * product name isn't announced twice.
   */
  decorative?: boolean;
};

export function BrandLogo({
  size = 32,
  className,
  decorative = false,
}: BrandLogoProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt={decorative ? "" : `${APP_NAME} logo`}
      width={size}
      height={size}
      priority
      className={cn("shrink-0 rounded-lg", className)}
    />
  );
}
