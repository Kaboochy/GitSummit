import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: "/api/auth",
  providers: [
    GitHub({
      authorization: {
        params: {
          scope: "read:user repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.githubId = profile.id as unknown as number;
        token.githubUsername = (profile as Record<string, unknown>).login as string;
        token.avatarUrl = (profile as Record<string, unknown>).avatar_url as string;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.githubId = token.githubId as number;
      session.user.githubUsername = token.githubUsername as string;
      session.user.avatarUrl = token.avatarUrl as string;
      return session;
    },
  },
  events: {
    async signIn({ account, profile }) {
      if (!profile) return;

      const ghProfile = profile as Record<string, unknown>;
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();

      await supabase.from("users").upsert(
        {
          github_id: ghProfile.id,
          github_username: ghProfile.login,
          avatar_url: ghProfile.avatar_url,
          display_name: (ghProfile.name || ghProfile.login) as string,
          github_access_token: account?.access_token,
        },
        { onConflict: "github_id" }
      );
    },
  },
});
