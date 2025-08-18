"use client";

import React, { createContext, useContext, useState, useMemo } from "react";

type DraftState = {
  starName: string;
  displayName: string;
  bio: string;
  avatar: string;
  setStarName: (v: string) => void;
  setDisplayName: (v: string) => void;
  setBio: (v: string) => void;
  setAvatar: (v: string) => void;
  reset: (
    next?: Partial<
      Pick<DraftState, "starName" | "displayName" | "bio" | "avatar">
    >
  ) => void;
};

const ProfileDraftContext = createContext<DraftState | null>(null);

export function ProfileDraftProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [starName, setStarName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  const value = useMemo<DraftState>(
    () => ({
      starName,
      displayName,
      bio,
      avatar,
      setStarName,
      setDisplayName,
      setBio,
      setAvatar,
      reset: (next) => {
        setStarName(next?.starName ?? "");
        setDisplayName(next?.displayName ?? "");
        setBio(next?.bio ?? "");
        setAvatar(next?.avatar ?? "");
      },
    }),
    [starName, displayName, bio, avatar]
  );

  return (
    <ProfileDraftContext.Provider value={value}>
      {children}
    </ProfileDraftContext.Provider>
  );
}

export function useProfileDraft() {
  const ctx = useContext(ProfileDraftContext);
  if (!ctx)
    throw new Error("useProfileDraft must be used within ProfileDraftProvider");
  return ctx;
}
