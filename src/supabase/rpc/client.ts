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
