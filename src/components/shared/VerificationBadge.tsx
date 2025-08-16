import React from "react";
import "@/styles/verification-badge-styles.css";
import { DEFAULT_STAR_DATA } from "@/config/starDefaultData";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const VBadge = {
  Premium: {
    styles: "PremiumStyles",
    textClass: "PremiumText",
    logo: "Premium",
  },
  Verified: {
    styles: "VerifiedStyles",
    textClass: "",
    logo: "Verified",
  },
} as const;

type StarLike = typeof DEFAULT_STAR_DATA & { isPremium?: boolean };

interface VerificationBadgeProps {
  star: StarLike | null;
  size: string | number;
  tooltip: boolean;
  sizeOfLogo?: number;
}

function VerificationBadge({
  star = DEFAULT_STAR_DATA,
  size,
  tooltip,
  sizeOfLogo,
}: VerificationBadgeProps) {
  const starLevel = star?.level || 0;
  const isPremium = Boolean(star?.isPremium);
  const isVerified = starLevel >= 10;
  const starBadge = isPremium
    ? VBadge.Premium
    : isVerified
    ? VBadge.Verified
    : null;

  const calculatedLogoSize = getCalculatedLogoSize(size, sizeOfLogo);

  if (!starBadge) {
    return <span style={{ fontSize: size }}>{star?.starName}</span>;
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span style={{ fontSize: size }}>
        <span
          className={`inline-flex items-center ${starBadge.textClass || ""}`}
        >
          {star?.starName}
        </span>
      </span>

      <BadgeDisplay
        badge={starBadge}
        tooltip={tooltip}
        logoSize={calculatedLogoSize}
      />
    </span>
  );
}

interface BadgeProps {
  className: string;
  praise: string;
  logoSize: number;
}

export const Badge = ({ className, praise, logoSize }: BadgeProps) => {
  return (
    <svg
      aria-label={praise}
      className={`${className}`}
      height={logoSize}
      width={logoSize}
      role="img"
      viewBox="0 0 40 40"
      fill="currentColor"
    >
      <path
        d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"
        fillRule="evenodd"
        className="fill-current"
      ></path>
    </svg>
  );
};

function getCalculatedLogoSize(
  size: number | string,
  explicit?: number
): number {
  if (explicit) return explicit;
  const numSize = typeof size === "number" ? size : parseFloat(size);
  if (Number.isNaN(numSize) || numSize <= 0) return 16; // sensible default
  if (numSize >= 24) return numSize * 0.5;
  if (numSize >= 20) return numSize * 0.7;
  if (numSize >= 15) return numSize * 0.8;
  return numSize * 0.6;
}

interface BadgeDisplayProps {
  badge: (typeof VBadge)[keyof typeof VBadge];
  tooltip: boolean;
  logoSize: number;
}

function BadgeDisplay({ badge, tooltip, logoSize }: BadgeDisplayProps) {
  const core = (
    <span className="inline-flex items-center translate-y-[0.05em]">
      <Badge className={badge.styles} praise={badge.logo} logoSize={logoSize} />
    </span>
  );
  if (!tooltip) return core;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{core}</TooltipTrigger>
        <TooltipContent side="top">{badge.logo}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default VerificationBadge;
