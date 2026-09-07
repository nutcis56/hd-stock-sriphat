import type { DefaultSession } from "next-auth";

type AppRole = "ADMIN" | "USER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: AppRole;
      position: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    role: AppRole;
    position: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: AppRole;
    position: string | null;
  }
}
