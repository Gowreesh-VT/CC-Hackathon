import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role?: "admin" | "judge" | "team";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "judge" | "team";
  }
}
