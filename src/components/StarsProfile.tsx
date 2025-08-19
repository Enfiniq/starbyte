"use client";

import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import VerificationBadge from "@/components/shared/VerificationBadge";
import ProfileButton from "@/components/profile/ProfileButton";
import React, { useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  CheckCircle2,
  Folder,
  ListChecks,
  StickyNote,
  Frown,
  Gift,
  Trophy,
  Star as StarIcon,
  Crown,
  Flame,
  AtSign,
  User,
  FileText,
} from "lucide-react";
import StatPills from "./shared/StatPills";
import { toast } from "sonner";
import useStar from "@/hooks/useStar";
import { followStar } from "@/supabase/rpc/client";

export type StarSummary = {
  id: string;
  starname: string;
  display_name?: string | null;
  bio: string | null;
  avatar: string | null;
  is_premium?: boolean | null;
  stardust: number | null;
  level: number | null;
  totalbytescompleted: number | null;
  current_streak: number | null;
  longest_streak: number | null;
};

export type ByteSummary = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
};

export type StarPublicProfile = {
  star: StarSummary;
  bytes: ByteSummary[];
  collections?: unknown[];
  proofs?: unknown[];
  regrets?: unknown[];
  notes?: unknown[];
  rewards?: unknown[];
  followers?: unknown[];
  following?: unknown[];
  participations?: unknown[];
};

export default function StarsProfilePublic({
  profile,
}: {
  profile: StarPublicProfile;
}) {
  const { star: me } = useStar();
  const {
    star,
    bytes,
    collections = [],
    regrets = [],
    notes = [],
    rewards = [],
    following = [],
    participations = [],
  } = profile;

  const contentTabs = [
    "Bytes",
    "Collections",
    "Participations",
    "Notes",
    "Regrets",
    "Rewards",
    "About",
  ] as const;
  const [activeTab, setActiveTab] =
    useState<(typeof contentTabs)[number]>("Bytes");

  const [followerCount, setFollowerCount] = useState<number>(
    profile.followers?.length ?? 0
  );

  const counts = useMemo(
    () => ({
      bytes: bytes?.length ?? 0,
      collections: collections?.length ?? 0,
      regrets: regrets?.length ?? 0,
      notes: notes?.length ?? 0,
      rewards: rewards?.length ?? 0,
      followers: followerCount,
      following: following?.length ?? 0,
      participations: participations?.length ?? 0,
    }),
    [
      bytes,
      collections,
      regrets,
      notes,
      rewards,
      followerCount,
      following,
      participations,
    ]
  );

  type BadgeStar = { starName: string; level: number; isPremium?: boolean };
  const starForBadge: BadgeStar = useMemo(
    () => ({
      starName: star.starname,
      displayName: star.display_name,
      level: star.level ?? 0,
      isPremium: Boolean(star.is_premium),
    }),
    [star]
  );

  type AboutItem = {
    key: string;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    value: React.ReactNode;
    multiline?: boolean;
  };

  const aboutItems = useMemo<AboutItem[]>(() => {
    const displayName = star.display_name ?? star.starname;
    return [
      {
        key: "displayName",
        label: "Display name",
        Icon: User,
        value: displayName ?? "—",
      },
      {
        key: "starname",
        label: "Star name",
        Icon: AtSign,
        value: star.starname ?? "—",
      },
      {
        key: "bio",
        label: "Bio",
        Icon: FileText,
        value: star.bio ?? "—",
        multiline: true,
      },
      { key: "bytes", label: "Bytes", Icon: CheckCircle2, value: counts.bytes },
      {
        key: "collections",
        label: "Collections",
        Icon: Folder,
        value: counts.collections,
      },
      {
        key: "participations",
        label: "Participations",
        Icon: ListChecks,
        value: counts.participations,
      },
      { key: "notes", label: "Notes", Icon: StickyNote, value: counts.notes },
      { key: "regrets", label: "Regrets", Icon: Frown, value: counts.regrets },
      { key: "rewards", label: "Rewards", Icon: Gift, value: counts.rewards },
      {
        key: "followers",
        label: "Followers",
        Icon: Users,
        value: counts.followers,
      },
      {
        key: "following",
        label: "Following",
        Icon: UserCheck,
        value: counts.following,
      },
      { key: "level", label: "Level", Icon: Trophy, value: star.level ?? 0 },
      {
        key: "stardust",
        label: "Stardust",
        Icon: StarIcon,
        value: star.stardust ?? 0,
      },
      {
        key: "premium",
        label: "Premium",
        Icon: Crown,
        value: star.is_premium ? "Yes" : "No",
      },
      {
        key: "current",
        label: "Current streak",
        Icon: Flame,
        value: star.current_streak ?? 0,
      },
      {
        key: "longest",
        label: "Longest streak",
        Icon: Trophy,
        value: star.longest_streak ?? 0,
      },
      {
        key: "completed",
        label: "Total completed",
        Icon: CheckCircle2,
        value: star.totalbytescompleted ?? 0,
      },
    ];
  }, [star, counts]);

  return (
    <div className="w-full">
      <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
          <div className="relative h-36 w-36 flex items-center justify-center rounded-full p-1">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4f7cff] to-blue-500 rounded-full p-4" />
            <div className="relative bg-white dark:bg-black h-full w-full rounded-full flex items-center justify-center">
              <Avatar className="h-32 w-32 border">
                <AvatarImage
                  src={star.avatar || undefined}
                  alt={`${star.starname}'s avatar`}
                />
                <AvatarFallback>
                  {star.starname?.slice(0, 2)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl flex items-center flex-wrap gap-2 md:gap-3">
                <span className="font-bold">
                  <VerificationBadge
                    star={starForBadge}
                    size={24}
                    tooltip={true}
                  />
                </span>
                <StatPills
                  currentStreak={star.current_streak}
                  totalBytes={star.totalbytescompleted}
                  longestStreak={star.longest_streak}
                  truncate
                  className="inline-flex items-center gap-2"
                />
              </h2>
              <p className="text-gray-500 dark:text-gray-300 max-w-prose">
                {star.bio}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
              <span>
                Level: <strong>{star.level ?? 0}</strong>
              </span>
              <span>
                Stardust: <strong>{star.stardust ?? 0}</strong>
              </span>
            </div>
            <div className="flex flex-wrap gap-6 items-center text-sm text-gray-700 dark:text-gray-300">
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" /> Followers:{" "}
                <strong>{counts.followers}</strong>
              </span>
              <span className="inline-flex items-center gap-2">
                <UserCheck className="h-4 w-4" /> Following:{" "}
                <strong>{counts.following}</strong>
              </span>
            </div>

            <div className="pt-2">
              <ProfileButton
                title="Follow"
                variant="primary"
                size="sm"
                ariaLabel="Follow star"
                onClick={async () => {
                  if (!me?.id) {
                    toast.error("Please sign in to follow");
                    return;
                  }
                  if (me.id === star.id) {
                    toast.message("You can't follow yourself");
                    return;
                  }
                  const res = await followStar(me.id, star.id);
                  if (!res.success) {
                    toast.error(res.error || "Failed to follow");
                    return;
                  }
                  if (!res.message) {
                    setFollowerCount((c) => c + 1);
                  }
                  toast.success(res.message || "Followed");
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-10 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 py-2">
            {contentTabs.map((tab) => (
              <button
                key={tab}
                className={`rounded-none inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 cursor-pointer ${
                  activeTab === tab
                    ? "text-primary border-t-2 border-[#4f7cff]"
                    : "text-gray-700 dark:text-gray-300"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === "Bytes" ? (
        <div className="py-6">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <h3 className="text-xl font-semibold mb-4">Bytes</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bytes && bytes.length > 0 ? (
                bytes.map((byte) => (
                  <li key={byte.id} className="border rounded p-4">
                    <div className="font-bold">
                      {byte.title || "Untitled Byte"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {byte.description || "No description"}
                    </div>
                  </li>
                ))
              ) : (
                <li>No bytes found.</li>
              )}
            </ul>
          </div>
        </div>
      ) : activeTab === "Collections" ? (
        <div className="py-6">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <h3 className="text-xl font-semibold mb-4">Collections</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collections && collections.length > 0 ? (
                collections.map((c, i) => (
                  <li key={i} className="border rounded p-4">
                    <div className="font-bold">Collection #{i + 1}</div>
                  </li>
                ))
              ) : (
                <li>No collections found.</li>
              )}
            </ul>
          </div>
        </div>
      ) : activeTab === "Participations" ? (
        <div className="py-6">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <h3 className="text-xl font-semibold mb-4">Participations</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participations && participations.length > 0 ? (
                participations.map((p, i) => (
                  <li key={i} className="border rounded p-4">
                    Participation #{i + 1}
                  </li>
                ))
              ) : (
                <li>No participations found.</li>
              )}
            </ul>
          </div>
        </div>
      ) : activeTab === "Notes" ? (
        <div className="py-6">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <h3 className="text-xl font-semibold mb-4">Notes</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes && notes.length > 0 ? (
                notes.map((n, i) => (
                  <li key={i} className="border rounded p-4">
                    Note #{i + 1}
                  </li>
                ))
              ) : (
                <li>No notes found.</li>
              )}
            </ul>
          </div>
        </div>
      ) : activeTab === "Regrets" ? (
        <div className="py-6">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <h3 className="text-xl font-semibold mb-4">Regrets</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regrets && regrets.length > 0 ? (
                regrets.map((r, i) => (
                  <li key={i} className="border rounded p-4">
                    Regret #{i + 1}
                  </li>
                ))
              ) : (
                <li>No regrets found.</li>
              )}
            </ul>
          </div>
        </div>
      ) : activeTab === "Rewards" ? (
        <div className="py-6">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <h3 className="text-xl font-semibold mb-4">Listed Rewards</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards && rewards.length > 0 ? (
                rewards.map((rw, i) => (
                  <li key={i} className="border rounded p-4">
                    Listed Reward #{i + 1}
                  </li>
                ))
              ) : (
                <li>No listed rewards found.</li>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div className="w-full py-6">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="rounded-lg bg-white dark:bg-zinc-900">
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {aboutItems.map(({ key, label, Icon, value, multiline }) => (
                  <li key={key} className="p-3">
                    <div
                      className={`flex ${
                        multiline ? "items-start" : "items-center"
                      } justify-between`}
                    >
                      <span className="inline-flex items-center gap-3 text-gray-800 dark:text-gray-200">
                        <Icon className="h-4 w-4 text-[#4f7cff]" /> {label}
                      </span>
                      {multiline ? (
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 max-w-prose text-right">
                          {value as string}
                        </p>
                      ) : (
                        <strong>{value}</strong>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
