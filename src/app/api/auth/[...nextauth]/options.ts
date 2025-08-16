import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import LinkedInProvider from "next-auth/providers/linkedin";
import TwitterProvider from "next-auth/providers/twitter";
import { createServerClient } from "@/supabase/server";

interface UserData {
  id: string;
  email: string;
  star_name: string;
  avatar?: string | null;
  bio?: string | null;
  stardust?: number | null;
  level?: number | null;
}

interface ExtendedUser extends User {
  customUserData?: UserData;
  id: string;
  starName: string;
  avatar?: string | null;
  bio?: string | null;
  stardust?: number | null;
  level?: number | null;
}

type AuthCode =
  | "OK"
  | "INVALID_INPUT"
  | "INVALID_CREDENTIALS"
  | "VERIFICATION_REQUIRED"
  | "DATABASE_ERROR";

async function rpcAuthenticate(
  identifier: string,
  password: string
): Promise<{ code: AuthCode; user?: UserData }> {
  if (!identifier || !password) return { code: "INVALID_INPUT" };
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("authenticate_user", {
    p_identifier: identifier,
    p_password: password,
  });
  if (error) return { code: "DATABASE_ERROR" };
  if (!data?.success) {
    if (data?.requires_verification) return { code: "VERIFICATION_REQUIRED" };
    return { code: "INVALID_CREDENTIALS" };
  }
  return { code: "OK", user: data.user as UserData };
}

function toExtendedUser(u: UserData): ExtendedUser {
  return {
    id: u.id,
    email: u.email,
    name: u.star_name,
    image: u.avatar ?? undefined,
    starName: u.star_name,
    avatar: u.avatar ?? null,
    bio: u.bio ?? null,
    stardust: u.stardust ?? 0,
    level: u.level ?? 0,
  } as ExtendedUser;
}

function getCredentialsProvider() {
  return CredentialsProvider({
    id: "credentials",
    name: "Credentials",
    credentials: {
      identifier: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(
      credentials: Record<string, string> | undefined
    ): Promise<User | null> {
      const result = await rpcAuthenticate(
        credentials?.identifier || "",
        credentials?.password || ""
      );
      if (result.code === "OK" && result.user)
        return toExtendedUser(result.user);
      if (result.code === "DATABASE_ERROR") throw new Error("DATABASE_ERROR");
      if (result.code === "VERIFICATION_REQUIRED")
        throw new Error("VERIFICATION_REQUIRED");
      return null;
    },
  });
}

function getSocialProviders() {
  const providers: NextAuthOptions["providers"] = [];
  type ProviderFactory = () => NextAuthOptions["providers"][number];
  const add = (enabled: boolean, factory: ProviderFactory) => {
    if (enabled) providers.push(factory());
  };

  add(
    Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    () =>
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      })
  );
  add(
    Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    () =>
      GithubProvider({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      })
  );
  add(
    Boolean(
      process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
    ),
    () =>
      FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID!,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      })
  );
  add(
    Boolean(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
    () =>
      TwitterProvider({
        clientId: process.env.TWITTER_CLIENT_ID!,
        clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      })
  );
  add(
    Boolean(
      process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET
    ),
    () =>
      LinkedInProvider({
        clientId: process.env.LINKEDIN_CLIENT_ID!,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      })
  );

  return providers;
}

export const authOptions: NextAuthOptions = {
  providers: [getCredentialsProvider(), ...getSocialProviders()],
  callbacks: {
    async signIn({ account }) {
      if (account?.provider !== "credentials") return true;
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && account.provider !== "credentials") {
        try {
          const supabase = await createServerClient();
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            "create_or_update_social_user",
            {
              p_email: user?.email ?? null,
              p_name: user?.name ?? null,
              p_image: (user as User | undefined)?.image ?? null,
            }
          );

          if (!rpcError && rpcData?.success && rpcData.user) {
            const u = rpcData.user as UserData;
            token.id = u.id;
            token.email = u.email;
            token.starName = u.star_name;
            token.avatar = u.avatar ?? null;
            token.bio = u.bio ?? null;
            token.stardust = u.stardust ?? 0;
            token.level = u.level ?? 0;
            return token;
          }

          if (rpcError)
            console.error("RPC create_or_update_social_user error:", rpcError);
        } catch (e) {
          console.error("One-click RPC error:", e);
        }

        token.email = token.email ?? user?.email ?? "";
        token.starName = token.starName ?? ((user?.name as string) || "");
        token.avatar =
          token.avatar ?? (user as User | undefined)?.image ?? null;
        token.bio = token.bio ?? null;
        token.stardust = token.stardust ?? 0;
        token.level = token.level ?? 0;

        return token;
      }

      if (user) {
        const extendedUser = user as ExtendedUser;
        token.id = extendedUser.id;
        token.email = extendedUser.email ?? "";
        token.starName = extendedUser.starName;
        token.avatar = extendedUser.avatar ?? null;
        token.bio = extendedUser.bio ?? null;
        token.stardust = extendedUser.stardust ?? 0;
        token.level = extendedUser.level ?? 0;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.starName = token.starName as string;
        session.user.avatar = (token.avatar as string | null) ?? null;
        session.user.bio = (token.bio as string | null) ?? null;
        session.user.stardust = (token.stardust as number | null) ?? 0;
        session.user.level = (token.level as number | null) ?? 0;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 60 * 60, // 1 hour
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/authentication?mode=signin",
    error: "/api/auth/error",
  },
  events: {
    async signIn({ user, account }) {
      console.log("Sign in event:", {
        user: user.email,
        provider: account?.provider,
      });
    },
  },
};
