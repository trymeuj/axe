import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { entitlements, users } from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  providers: [Google],
  pages: { signIn: "/auth/signin" },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google" || !account.providerAccountId || !user.email) {
        return false;
      }

      const now = new Date();
      const inserted = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          googleSubject: account.providerAccountId,
          email: user.email,
          name: user.name ?? profile?.name ?? null,
          image: user.image ?? null,
          lastLoginAt: now,
        })
        .onConflictDoUpdate({
          target: users.googleSubject,
          set: {
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
            updatedAt: now,
            lastLoginAt: now,
          },
        })
        .returning({ id: users.id });

      await db
        .insert(entitlements)
        .values({ userId: inserted[0].id })
        .onConflictDoNothing({ target: entitlements.userId });

      return true;
    },
    async jwt({ token, account }) {
      const googleSubject = account?.provider === "google"
        ? account.providerAccountId
        : typeof token.googleSubject === "string"
          ? token.googleSubject
          : null;

      if (googleSubject) {
        token.googleSubject = googleSubject;
        const axeUser = await db.query.users.findFirst({
          where: eq(users.googleSubject, googleSubject),
          columns: { id: true },
        });
        token.axeUserId = axeUser?.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.axeUserId === "string") {
        session.user.id = token.axeUserId;
      }
      return session;
    },
  },
});
