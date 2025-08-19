import { createBrowserClient } from "@/supabase/client";

export async function getStarPublicProfile({
  starId,
  starname,
}: {
  starId?: string;
  starname?: string;
}) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc("get_star_public_profile", {
    p_star_id: starId ?? null,
    p_starname: starname ?? null,
  });
  if (error) {
    console.error("Get star public profile error:", error);
    try {
      const selectCols =
        "id, star_name, display_name, bio, avatar, is_premium, stardust, level, total_bytes_completed, current_streak, longest_streak";
      const query = starId
        ? supabase.from("stars").select(selectCols).eq("id", starId).single()
        : supabase
            .from("stars")
            .select(selectCols)
            .eq("star_name", starname)
            .single();
      const { data: fallbackStar, error: fallbackErr } = await query;
      if (fallbackErr || !fallbackStar) {
        return { success: false, error: "Error fetching profile" } as const;
      }
      return {
        success: true,
        star: {
          id: fallbackStar.id,
          starname: fallbackStar.star_name,
          display_name: fallbackStar.display_name,
          bio: fallbackStar.bio,
          avatar: fallbackStar.avatar,
          is_premium: fallbackStar.is_premium,
          stardust: fallbackStar.stardust,
          level: fallbackStar.level,
          totalbytescompleted: fallbackStar.total_bytes_completed,
          current_streak: fallbackStar.current_streak,
          longest_streak: fallbackStar.longest_streak,
          followers_count: 0,
          following_count: 0,
        },
        bytes: [],
        collections: [],
        proofs: [],
        regrets: [],
        notes: [],
        rewards: [],
        followers: [],
        following: [],
        participations: [],
      } as const;
    } catch (err) {
      console.error("Fallback star fetch failed:", err);
      return { success: false, error: "Error fetching profile" } as const;
    }
  }
  if (!data?.success) {
    return { success: false, error: data?.error || "Not found" } as const;
  }

  return {
    success: true,
    star: data.star,
    bytes: data.bytes,
    collections: data.collections,
    proofs: data.proofs,
    regrets: data.regrets,
    notes: data.notes,
    rewards: data.rewards,
    followers: data.followers,
    following: data.following,
    participations: data.participations,
  } as const;
}

export async function followStar(followerId: string, followingId: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc("follow_star", {
    p_follower_id: followerId,
    p_following_id: followingId,
  });
  if (error) {
    console.error("Follow star error:", error);
    return { success: false, error: "Failed to follow/unfollow" } as const;
  }
  return data as {
    success: boolean;
    error?: string;
    message?: string;
    action?: "followed" | "unfollowed";
  };
}

export async function checkUsernameUnique(username: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc("check_username_unique", {
    p_username: username,
  });

  if (error) {
    console.error("Username check error:", error);
    return { success: false, error: "Error checking username" } as const;
  }

  return data as { success: boolean; message?: string };
}

export async function getUserById(userId: string) {
  const supabase = createBrowserClient();
  const { data: user, error } = await supabase
    .from("stars")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Get user error:", error);
    return null;
  }

  return user;
}

export async function getUserByUsername(username: string) {
  const supabase = createBrowserClient();
  const { data: user, error } = await supabase
    .from("stars")
    .select("*")
    .eq("star_name", username)
    .single();

  if (error) {
    console.error("Get user by username error:", error);
    return null;
  }

  return user;
}

export async function spendStardust(userId: string, amount: number) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc("spend_stardust", {
    p_user_id: userId,
    p_amount: amount,
  });
  if (error) {
    console.error("Spend stardust error:", error);
    return { success: false, error: "Error spending stardust" } as const;
  }
  return data as { success: boolean; stardust?: number; error?: string };
}

export async function updateStarProfile(params: {
  userId: string;
  starName: string;
  displayName: string;
  bio?: string;
  avatar?: string;
}) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc("update_star_profile", {
    p_user_id: params.userId,
    p_star_name: params.starName,
    p_display_name: params.displayName,
    p_bio: params.bio ?? null,
    p_avatar: params.avatar ?? null,
  });
  if (error) {
    console.error("Update star profile error:", error);
    return { success: false, error: "Error updating profile" } as const;
  }
  return data as { success: boolean; error?: string };
}

export async function getLeaderboardPage(params?: {
  limit?: number;
  offset?: number;
}) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc("get_leaderboard", {
    p_metric: "total_bytes",
    p_limit: params?.limit ?? 20,
    p_offset: params?.offset ?? 0,
  });
  if (error || !data) {
    console.error("Get leaderboard error:", error);
    return {
      success: false,
      items: [],
      has_more: false,
      next_offset: 0,
      total: 0,
    } as const;
  }
  return data as {
    success: boolean;
    items: Array<{
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
    }>;
    has_more: boolean;
    next_offset: number;
    total: number;
  };
}
