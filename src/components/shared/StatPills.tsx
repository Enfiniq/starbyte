"use client";

import React from "react";
import { Flame, Trophy, CheckCircle2 } from "lucide-react";

type Props = {
  currentStreak?: number | null;
  totalBytes?: number | null;
  longestStreak?: number | null;
  truncate?: boolean;
  className?: string;
};

export default function StatPills({
  currentStreak,
  totalBytes,
  longestStreak,
  truncate = true,
  className,
}: Props) {
  const thresholdHot = 30;
  const isHot = (n?: number | null) => (n ?? 0) >= thresholdHot;

  const pillBase =
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs sm:text-sm font-normal transition-all";
  const pillClass = (hot: boolean, lightBorder = false) =>
    hot
      ? `${pillBase} border border-transparent text-white bg-gradient-to-r from-[#4f7cff] to-blue-400`
      : `${pillBase} border ${
          lightBorder ? "border-[#4f7cff]/50" : "border-[#4f7cff]"
        } text-[#4f7cff] bg-[#4f7cff]/5`;

  const fmt = (v?: number | null) => {
    const n = v ?? 0;
    if (!truncate) return String(n);
    if (n <= 0) return "0";
    if (n >= 30) return "30+";
    return String(n);
  };

  return (
    <span className={className}>
      <span className={pillClass(isHot(currentStreak))}>
        <Flame className="h-4 w-4" /> {fmt(currentStreak)} day streak
      </span>
      <span className={pillClass(isHot(totalBytes), true)}>
        <CheckCircle2 className="h-4 w-4" /> {fmt(totalBytes)} bytes
      </span>
      <span className={pillClass(isHot(longestStreak), true)}>
        <Trophy className="h-4 w-4" /> longest {fmt(longestStreak)}d
      </span>
    </span>
  );
}
