import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      githubId: number;
      githubUsername: string;
      avatarUrl: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    githubId?: number;
    githubUsername?: string;
    avatarUrl?: string;
  }
}
