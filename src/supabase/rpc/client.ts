import { createBrowserClient } from "@/supabase/client";

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
