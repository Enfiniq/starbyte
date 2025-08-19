"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerificationBadge from "@/components/shared/VerificationBadge";
import StatPills from "@/components/shared/StatPills";
import { getLeaderboardPage } from "@/supabase/rpc/client";
import Link from "next/link";
import Loader from "@/components/loader";

export type LeaderboardItem = {
  rank: number;
  id: string;
  starname: string;
  display_name?: string | null;
  avatar?: string | null;
  is_premium?: boolean | null;
  stardust?: number | null;
  level?: number | null;
  totalbytescompleted?: number | null;
  current_streak?: number | null;
  longest_streak?: number | null;
};

export default function Page() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const fetchOnce = async () => {
      setLoading(true);
      const res = await getLeaderboardPage({ limit: 50, offset: 0 });
      if (!ignore && res?.success) {
        setItems(res.items);
      }
      setLoading(false);
    };
    fetchOnce();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return <Loader className="bg-white dark:bg-black" />;
  }

  if (!items.length && !loading) {
    return (
      <>
        <div className="h-[80vh] w-full py-20 mx-auto text-center flex flex-col justify-center items-center max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            No Data Yet
          </h1>
        </div>
      </>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="rounded-lg bg-white dark:bg-zinc-900 p-0 sm:p-3">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {items.map((it) => {
            const name = it.display_name || it.starname;
            const starForBadge = {
              starName: name,
              level: it.level ?? 0,
              isPremium: Boolean(it.is_premium),
            };
            return (
              <li key={`${it.rank}-${it.id}`} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-4 sm:gap-5 text-gray-800 dark:text-gray-200">
                    <span className="w-8 sm:w-10 text-right tabular-nums font-semibold">
                      {it.rank}
                    </span>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={it.avatar || undefined} alt={name} />
                      <AvatarFallback>
                        {name?.slice(0, 2)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Link href={`/star/${it.starname}`}>
                      <span className="font-medium">
                        <VerificationBadge
                          star={starForBadge}
                          size={18}
                          tooltip={true}
                        />
                      </span>
                    </Link>
                  </div>
                  <StatPills
                    currentStreak={it.current_streak}
                    totalBytes={it.totalbytescompleted}
                    longestStreak={it.longest_streak}
                    truncate={false}
                    className="inline-flex items-center gap-2"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
