"use client";
import React, { createContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star } from "@/types/Star";
import { StarContextType, StarProviderProps } from "@/types/StarContext";
import { DEFAULT_STAR_DATA } from "@/config/starDefaultData";
import { getUserByUsername } from "@/supabase/rpc/client";

const StarContext = createContext<StarContextType | undefined>(undefined);

const StarProvider = ({ children }: StarProviderProps) => {
  const [star, setStar] = useState<Star | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  const fetchStarData = async (starName: string) => {
    if (!starName) return;
    setLoading(true);
    try {
      const user = await getUserByUsername(starName);
      if (user) {
        const mapped: Star = {
          id: user.id ?? DEFAULT_STAR_DATA.id,
          email: user.email ?? DEFAULT_STAR_DATA.email,
          starName: user.star_name ?? DEFAULT_STAR_DATA.starName,
          avatar: user.avatar ?? DEFAULT_STAR_DATA.avatar,
          bio: user.bio ?? DEFAULT_STAR_DATA.bio,
          stardust: user.stardust ?? DEFAULT_STAR_DATA.stardust,
          level: user.level ?? DEFAULT_STAR_DATA.level,
          displayName: user.display_name ?? DEFAULT_STAR_DATA.displayName,
          totalBytesCompleted:
            user.total_bytes_completed ?? DEFAULT_STAR_DATA.totalBytesCompleted,
          currentStreak: user.current_streak ?? DEFAULT_STAR_DATA.currentStreak,
          longestStreak: user.longest_streak ?? DEFAULT_STAR_DATA.longestStreak,
          isPremium: user.is_premium ?? DEFAULT_STAR_DATA.isPremium,
        };
        setStar(mapped);
        try {
          localStorage.setItem("star", JSON.stringify(mapped));
        } catch {}
      }
    } catch (error) {
      console.error("Failed to fetch star data:", error);
    } finally {
      setLoading(false);
    }
  };

  const logoutStar = async () => {
    setLoading(true);
    try {
      setStar(null);
      localStorage.removeItem("star");
    } catch (error) {
      console.log("Failed to remove star", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (status === "authenticated" && session?.user) {
      interface SessionUser {
        id?: string;
        email?: string;
        starName?: string;
        name?: string | null;
        avatar?: string | null;
        bio?: string | null;
        stardust?: number | null;
        level?: number | null;
        displayName?: string | null;
        totalBytesCompleted?: number | null;
        currentStreak?: number | null;
        longestStreak?: number | null;
        isPremium?: boolean | null;
      }
      const sUser = session.user as unknown as SessionUser;
      const mapped: Star = {
        ...DEFAULT_STAR_DATA,
        id: sUser.id ?? DEFAULT_STAR_DATA.id,
        email: sUser.email ?? DEFAULT_STAR_DATA.email,
        starName: sUser.starName || sUser.name || DEFAULT_STAR_DATA.starName,
        avatar: sUser.avatar ?? DEFAULT_STAR_DATA.avatar,
        bio: sUser.bio ?? DEFAULT_STAR_DATA.bio,
        stardust: (sUser.stardust ?? DEFAULT_STAR_DATA.stardust) as number,
        level: (sUser.level ?? DEFAULT_STAR_DATA.level) as number,
        displayName: sUser.displayName ?? DEFAULT_STAR_DATA.displayName,
        totalBytesCompleted: (sUser.totalBytesCompleted ??
          DEFAULT_STAR_DATA.totalBytesCompleted) as number,
        currentStreak: (sUser.currentStreak ??
          DEFAULT_STAR_DATA.currentStreak) as number,
        longestStreak: (sUser.longestStreak ??
          DEFAULT_STAR_DATA.longestStreak) as number,
        isPremium: (sUser.isPremium ?? DEFAULT_STAR_DATA.isPremium) as boolean,
      };
      setStar(mapped);
      try {
        localStorage.setItem("star", JSON.stringify(mapped));
      } catch {}
      fetchStarData(mapped.starName);
    } else {
      // try {
      //   localStorage.removeItem("star");
      // } catch {}
      // setStar(DEFAULT_STAR_DATA);
    }
    setLoading(false);
  }, [session, status]);

  return (
    <StarContext.Provider
      value={{ star, setStar, fetchStarData, logoutStar, loading }}
    >
      {children}
    </StarContext.Provider>
  );
};

export { StarContext, StarProvider };
