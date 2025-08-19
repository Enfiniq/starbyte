"use client";

import { useEffect, useState } from "react";
import { getRewards, type RewardListItem } from "@/supabase/rpc/client";
import RewardsListing from "@/components/RewardsListing";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketplacePage() {
  const [items, setItems] = useState<RewardListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getRewards({
          limit: 50,
          offset: 0,
          onlyActive: true,
        });
        if (!res.success)
          throw new Error(res.error || "Failed to load rewards");
        setItems(res.items);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load rewards";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-square" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((reward, idx) => (
            <RewardsListing key={reward.id} reward={reward} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
