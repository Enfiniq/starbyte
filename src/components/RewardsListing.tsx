"use client";

import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import ImageSlider from "./ImageSlider";

export interface RewardsListingProps {
  reward: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    type: string;
    image_url?: string[] | null;
    is_active: boolean;
    usage_type: string;
    delivery_type: string;
    delivery_instructions?: string | null;
    delivery_data?: Array<{
      stock?: number | null;
      used?: number | null;
    } | null> | null;
    lister_avatar_url?: string | null;
    lister_display_name?: string | null;
    lister_star_name?: string | null;
  };
  index: number;
}

const RewardsListing = ({ reward, index }: RewardsListingProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 60);
    return () => clearTimeout(timer);
  }, [index]);

  const totals = useMemo(() => {
    const arr = reward.delivery_data ?? [];
    return arr.reduce<{ stock: number; used: number }>(
      (acc, entry) => {
        if (!entry) return acc;
        acc.stock += Math.max(0, entry.stock ?? 0);
        acc.used += Math.max(0, entry.used ?? 0);
        return acc;
      },
      { stock: 0, used: 0 }
    );
  }, [reward]);

  if (!isVisible) return <RewardsPlaceholder />;

  const urls: string[] = Array.isArray(reward.image_url)
    ? reward.image_url
    : [];

  return (
    <div className="group">
      <Link
        href={`/marketplace/${reward.id}`}
        className="block"
        aria-label={reward.title}
      >
        <div className="relative w-full aspect-square bg-zinc-100 overflow-hidden rounded-md">
          {urls.length > 0 ? (
            <ImageSlider urls={urls} />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-xs text-zinc-500">
              No image
            </div>
          )}
          <div className="z-10 absolute top-2 right-2">
            <span
              className={`inline-block h-4 w-4 rounded-full border-4 ${
                reward.is_active ? "border-primary" : "border-zinc-400"
              } bg-transparent`}
              title={reward.is_active ? "Active" : "Inactive"}
            />
          </div>
          <div className="z-10 absolute bottom-2 right-2">
            <span className="inline-flex items-center gap-2 rounded-full px-2 py-[0.5] text-xs font-normal transition-all uppercase border border-transparent text-white bg-gradient-to-r from-[#4f7cff] to-blue-400">
              {reward.delivery_type}
            </span>
          </div>
        </div>
        <div className="pt-2 space-y-2">
          <div className="flex items-start gap-3">
            <Link href={`/star/${reward.lister_star_name ?? ""}`}>
              <Avatar>
                <AvatarImage
                  src={reward.lister_avatar_url ?? undefined}
                  alt={
                    reward.lister_display_name ??
                    reward.lister_star_name ??
                    "Lister"
                  }
                />
                <AvatarFallback>
                  {(
                    reward.lister_display_name ||
                    reward.lister_star_name ||
                    reward.title ||
                    "?"
                  )
                    .slice(0, 1)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <h3 className="font-medium leading-tight line-clamp-2 flex-1 min-w-0">
                  {reward.title}
                </h3>
                <span className="font-medium inline-flex items-center gap-1">
                  <Star className="h-4 w-4 text-primary" aria-hidden="true" />
                  {reward.price}
                </span>
              </div>
              {reward.description ? (
                <p className="mt-1 text-sm text-muted-foreground leading-snug line-clamp-2">
                  {reward.description}
                </p>
              ) : null}
              <div className="mt-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-normal border border-[#4f7cff] text-[#4f7cff] bg-[#4f7cff]/5 uppercase">
                  {reward.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  Used {totals.used} / {totals.stock}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

const RewardsPlaceholder = () => {
  return (
    <div className="group">
      <div className="relative w-full aspect-square overflow-hidden rounded-md">
        <Skeleton className="absolute inset-0 h-full w-full" />
      </div>
      <div className="pt-2 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
};

export const BannerPlaceholder = () => {
  return (
    <div className="space-y-16">
      <div className="w-full flex justify-center">
        <div className="w-full flex flex-col md:flex-row items-center">
          <Skeleton className="w-full md:w-1/2 aspect-video" />

          <div className="hidden md:flex flex-col gap-5 p-5 w-1/2 aspect-video">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-1/2 rounded-lg" />
              <Skeleton className="h-6 w-6 rounded-full ml-auto" />
            </div>

            <div className="flex flex-col gap-2 lg:gap-5">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
            </div>
          </div>

          <div className="flex md:hidden w-full gap-4 p-1 mt-6">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex flex-col gap-2 w-full">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-full" />
              <div className="w-1/3 flex items-center gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <div className="w-1/2 flex items-center gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="flex gap-2 md:gap-4 lg:gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-1/6" />
          ))}
        </div>
      </div>

      <div className="w-full">
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
};

export default RewardsListing;
