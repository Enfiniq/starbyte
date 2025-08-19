"use client";

import Loader from "@/components/loader";
import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import StarsProfilePublic, {
  StarPublicProfile,
  ByteSummary,
} from "@/components/StarsProfile";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getStarPublicProfile } from "@/supabase/rpc/client";

function Page() {
  const params = useParams<{ starName?: string }>();
  const starName = (params?.starName as string | undefined) || undefined;

  const [profile, setProfile] = useState<StarPublicProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    if (!starName) {
      setLoading(false);
      setError("No star name provided");
      return;
    }
    const fetchProfile = async () => {
      const res = await getStarPublicProfile({ starname: starName });
      if (!res.success) {
        setError(res.error || "Profile not found");
        setProfile(null);
      } else {
        setProfile({
          star: res.star as StarPublicProfile["star"],
          bytes: (res.bytes ?? []) as ByteSummary[],
          collections: res.collections ?? [],
          notes: res.notes ?? [],
          regrets: res.regrets ?? [],
          rewards: res.rewards ?? [],
          followers: res.followers ?? [],
          following: res.following ?? [],
          participations: res.participations ?? [],
        });
        setError(null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [starName]);

  if (loading) {
    return <Loader className="bg-white dark:bg-black" />;
  }

  if (error) {
    return (
      <MaxWidthWrapper className="h-[80vh] w-full py-20 mx-auto text-center flex flex-col justify-center items-center max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Error Finding User with the starName{" "}
          <span className="text-skin-base-600 dark:text-skin-base-500">
            {starName}
          </span>
        </h1>
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper>
      {profile && <StarsProfilePublic profile={profile} />}
    </MaxWidthWrapper>
  );
}

export default Page;
