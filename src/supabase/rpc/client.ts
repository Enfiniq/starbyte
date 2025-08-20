import { createBrowserClient } from "@/supabase/client";

export type RewardSummary = {
  id: string;
  lister_id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  image_url?: string[] | null;
  is_active: boolean;
  usage_type: string;
  delivery_type: string;
  delivery_instructions?: string | null;
  stock_total: number;
  used_total: number;
};

export type PurchaseRewardResult =
  | ({ success: true } & (
      | { type: "code"; data: { code: string } }
      | { type: "link"; data: { link: string } }
      | {
          type: "fetch";
          data: {
            fetch: {
              url: string;
              method?: string;
              headers?: Record<string, string>;
              body?: unknown;
            };
          };
        }
    ) & { receipt_id?: string })
  | { success: false; error: string };

export type RewardListItem = {
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
  lister_id?: string | null;
  lister_avatar_url?: string | null;
  lister_display_name?: string | null;
  lister_star_name?: string | null;
};

export async function getRewards(params?: {
  limit?: number;
  offset?: number;
  onlyActive?: boolean;
}) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc("get_rewards", {
    p_limit: params?.limit ?? 50,
    p_offset: params?.offset ?? 0,
    p_only_active: params?.onlyActive ?? true,
  });
  if (error || !data) {
    console.error("Get rewards error:", error);
    return {
      success: false,
      items: [],
      error: "Error fetching rewards",
    } as const;
  }
  if (!data.success) {
    return {
      success: false,
      items: [],
      error: data.error ?? "Error fetching rewards",
    } as const;
  }
  return {
    success: true,
    items: (data.items ?? []) as RewardListItem[],
  } as const;
}

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

export async function getRewardById(rewardId: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc("get_reward_by_id", {
    p_reward_id: rewardId,
  });
  if (error || !data) {
    console.error("Get reward by id error:", error);
    return { success: false, error: "Error fetching reward" } as const;
  }
  return data as {
    success: boolean;
    error?: string;
    reward?: RewardSummary;
  };
}

export async function purchaseReward(buyerId: string, rewardId: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc("purchase_reward", {
    p_buyer_id: buyerId,
    p_reward_id: rewardId,
  });
  if (error || !data) {
    console.error("Purchase reward error:", error);
    return { success: false, error: "Error purchasing reward" } as const;
  }
  return data as PurchaseRewardResult;
}

export type ByteCard = {
  id: string;
  title: string;
  created_at?: string;
  star_name?: string;
  display_name?: string | null;
  avatar?: string | null;
  is_premium?: boolean | null;
  level?: number | null;
  current_participants?: number | null;
  stardust_reward?: number | null;
  preview_image_url?: string[] | null;
  byte_type?: string | null;
  byte_difficulty?: string | null;
  byte_category?: string | null;
  estimated_duration_minutes?: number | null;
  required_proofs_count?: number | null;
  recurrence_type?: string | null;
  custom_recurrence_days?: number | null;
  challenge_type?: string | null;
  duration_days?: number | null;
  source_type?: "hot" | "highest" | "latest" | "following" | "embedding" | null;
  description?: string | null;
  is_active?: boolean | null;
  max_participants?: number | null;
  auto_approve?: boolean | null;
  requires_proof?: boolean | null;
  proof_instructions?: string | null;
  is_featured?: boolean | null;
  completions_count?: number | null;
  bonus_stardust?: number | null;
  max_bonus_recipients?: number | null;
  bonus_recipients_count?: number | null;
  expires_at?: string | null;
  tags?: string[] | null;
  collection_id?: string | null;
};

export type CollectionCard = {
  id: string;
  title: string;
  image_url?: string | null;
  total_participants: number;
  bytes_count: number;
};

export type HomepageBytesData = {
  success: boolean;
  error?: string;
  collections?: CollectionCard[];
  bytes?: ByteCard[];
  rewards?: RewardListItem[];
};

export async function getHomepageBytes(params?: {
  type?: "all" | "physical" | "digital";
  totalBytes?: number;
  userId?: string;
}) {
  const supabase = createBrowserClient();

  let userId = params?.userId;
  if (!userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id || undefined;
  }

  const { data, error } = await supabase.rpc("get_homepage_bytes", {
    p_type_filter: params?.type ?? "all",
    p_total_bytes: params?.totalBytes ?? 50,
    p_user_id: userId || null,
  });

  if (error || !data) {
    console.error("get_homepage_bytes error:", error);
    return { success: false, error: "Error fetching homepage bytes" } as const;
  }

  if (data?.success && data?.bytes) {
    console.log(`Homepage bytes loaded: ${data.bytes.length} items`);
    console.log(
      "Source distribution:",
      data.bytes.reduce((acc: Record<string, number>, byte: ByteCard) => {
        const source = byte.source_type || "unknown";
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {})
    );
  }

  return data as HomepageBytesData;
}

export type ParticipatingByte = {
  id: string;
  title: string;
  description: string | null;
  stardust_reward: number | null;
  expires_at?: string | null;
  preview_image_url?: string[] | null;
  created_at?: string | null;
  requires_proof?: boolean | null;
  duration_days?: number | null;
  creator: {
    star_name: string;
    display_name?: string | null;
    avatar?: string | null;
    is_verified?: boolean | null;
  };
  participation: {
    id: string;
    status: "active" | "completed" | string;
    joined_at: string;
    completed_at?: string | null;
    current_proof_count: number;
    required_proof_count: number;
    stardust_earned?: number | null;
    progress_percentage: number;
  };
};

export async function getUserParticipatingBytes(params: {
  starId?: string;
  status?: "active" | "completed" | string | null;
  limit?: number;
  offset?: number;
}) {
  const supabase = createBrowserClient();
  let starId = params.starId;
  if (!starId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    starId = user?.id || undefined;
  }
  if (!starId) {
    return { success: false, bytes: [], error: "Not authenticated" } as const;
  }
  const { data, error } = await supabase.rpc("get_user_participating_bytes", {
    p_star_id: starId,
    p_status: params.status ?? null,
    p_limit: params.limit ?? 50,
    p_offset: params.offset ?? 0,
  });
  if (error || !data) {
    console.error("get_user_participating_bytes error:", error);
    return {
      success: false,
      bytes: [],
      error: "Error fetching bytes",
    } as const;
  }
  if (!data.success) {
    return { success: false, bytes: [], error: data.error || "Error" } as const;
  }
  return {
    success: true,
    bytes: (data.bytes ?? []) as ParticipatingByte[],
  } as const;
}

export async function submitByteProof(args: {
  byteId: string;
  starId?: string;
  proofText?: string | null;
  proofImageUrl?: string | null;
}) {
  const supabase = createBrowserClient();
  let starId = args.starId;
  if (!starId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    starId = user?.id || undefined;
  }
  if (!starId) return { success: false, error: "Not authenticated" } as const;
  const { data, error } = await supabase.rpc("submit_byte_proof", {
    p_byte_id: args.byteId,
    p_star_id: starId,
    p_proof_text: args.proofText ?? null,
    p_proof_image_url: args.proofImageUrl ?? null,
  });
  if (error || !data) {
    console.error("submit_byte_proof error:", error);
    return { success: false, error: "Error submitting proof" } as const;
  }
  return data as {
    success: boolean;
    error?: string;
    message?: string;
    is_completed?: boolean;
    proof_id?: string;
  };
}

export async function createProgressNote(args: {
  starId?: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  byteId?: string | null;
  isQuestion?: boolean;
}) {
  const supabase = createBrowserClient();
  let starId = args.starId;
  if (!starId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    starId = user?.id || undefined;
  }
  if (!starId) return { success: false, error: "Not authenticated" } as const;
  const { data, error } = await supabase.rpc("create_progress_note", {
    p_star_id: starId,
    p_byte_id: args.byteId ?? null,
    p_title: args.title,
    p_content: args.content,
    p_image_url: args.imageUrl ?? null,
    p_is_question: args.isQuestion ?? false,
  });
  if (error || !data) {
    console.error("create_progress_note error:", error);
    return { success: false, error: "Error creating note" } as const;
  }
  return data as {
    success: boolean;
    error?: string;
    message?: string;
    note_id?: string;
  };
}

export async function createRegret(args: {
  starId?: string;
  content: string;
  title?: string | null;
  byteId?: string | null;
}) {
  const supabase = createBrowserClient();
  let starId = args.starId;
  if (!starId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    starId = user?.id || undefined;
  }
  if (!starId) return { success: false, error: "Not authenticated" } as const;
  const { data, error } = await supabase.rpc("create_regret", {
    p_star_id: starId,
    p_byte_id: args.byteId ?? null,
    p_title: args.title ?? null,
    p_content: args.content,
  });
  if (error || !data) {
    console.error("create_regret error:", error);
    return { success: false, error: "Error creating regret" } as const;
  }
  return data as {
    success: boolean;
    error?: string;
    message?: string;
    regret_id?: string;
  };
}

export async function acceptByteChallenge(args: {
  byteId: string;
  starId?: string;
}) {
  const supabase = createBrowserClient();
  let starId = args.starId;
  if (!starId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    starId = user?.id || undefined;
  }
  if (!starId) return { success: false, error: "Not authenticated" } as const;
  const { data, error } = await supabase.rpc("accept_byte_challenge", {
    p_byte_id: args.byteId,
    p_star_id: starId,
  });
  if (error || !data) {
    console.error("accept_byte_challenge error:", error);
    return { success: false, error: "Error accepting byte" } as const;
  }
  return data as {
    success: boolean;
    error?: string;
    message?: string;
    participation_id?: string;
  };
}

export type ByteDetailsResponse = {
  success: boolean;
  error?: string;
  byte?: ByteDetails;
  comments?: ByteComment[];
  proofs?: ByteProof[];
  progress_notes?: ProgressNote[];
  regrets?: Regret[];
};

export async function getByteDetails(
  byteId: string,
  requestingStarId?: string
) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc("get_byte_details", {
    p_byte_id: byteId,
    p_requesting_star_id: requestingStarId ?? null,
  });
  if (error || !data) {
    console.error("get_byte_details error:", error);
    return { success: false, error: "Error fetching byte" } as const;
  }
  return data as ByteDetailsResponse;
}

export type ByteAuthor = {
  star_name: string;
  display_name?: string | null;
  avatar?: string | null;
  is_verified?: boolean | null;
  level?: number | null;
  is_premium?: boolean | null;
};

export type ByteDetails = {
  id: string;
  title: string;
  description: string | null;
  type?: string | null;
  category?: string | null;
  difficulty?: string | null;
  stardust_reward?: number | null;
  estimated_duration_minutes?: number | null;
  max_participants?: number | null;
  current_participants?: number | null;
  requires_proof?: boolean | null;
  auto_approve?: boolean | null;
  proof_instructions?: string | null;
  required_proofs_count?: number | null;
  tags?: string[] | null;
  duration_days?: number | null;
  expires_at?: string | null;
  preview_image_url?: string[] | null;
  created_at?: string | null;
  recurrence_type?: string | null;
  custom_recurrence_days?: number | null;
  completions_count?: number | null;
  is_active?: boolean | null;
  challenge_type?: string | null;
  creator: ByteAuthor;
  user_participation?: {
    id: string;
    status: string;
    joined_at: string;
    completed_at?: string | null;
    current_proof_count: number;
    required_proof_count: number;
    stardust_earned?: number | null;
  } | null;
};

export type ByteComment = {
  id: string;
  content: string;
  created_at: string;
  author: ByteAuthor;
};

export type ByteProof = {
  id: string;
  proof_number: number;
  proof_text?: string | null;
  proof_image_url?: string | null;
  submitted_at: string;
  is_approved: boolean;
  approved_at?: string | null;
  participant: {
    star_name: string;
    display_name?: string | null;
    avatar?: string | null;
    is_verified?: boolean | null;
  };
};

export type ProgressNote = {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  is_question: boolean;
  created_at: string;
  author: ByteAuthor;
};

export type Regret = {
  id: string;
  title?: string | null;
  content: string;
  created_at: string;
  author: ByteAuthor;
};

export async function addByteComment(args: {
  byteId: string;
  starId?: string;
  content: string;
}) {
  const supabase = createBrowserClient();
  let starId = args.starId;
  if (!starId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    starId = user?.id || undefined;
  }
  if (!starId) return { success: false, error: "Not authenticated" } as const;
  const { data, error } = await supabase.rpc("add_byte_comment", {
    p_byte_id: args.byteId,
    p_star_id: starId,
    p_content: args.content,
  });
  if (error || !data) {
    console.error("add_byte_comment error:", error);
    return { success: false, error: "Error adding comment" } as const;
  }
  return data as {
    success: boolean;
    error?: string;
    message?: string;
    comment_id?: string;
  };
}
