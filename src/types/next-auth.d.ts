import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      starName: string;
      avatar?: string | null;
      bio?: string | null;
      stardust?: number | null;
      level?: number | null;
    };
  }

  interface User {
    id: string;
    starName?: string;
    avatar?: string | null;
    bio?: string | null;
    stardust?: number | null;
    level?: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    starName: string;
    avatar?: string | null;
    bio?: string | null;
    stardust?: number | null;
    level?: number | null;
  }
}
