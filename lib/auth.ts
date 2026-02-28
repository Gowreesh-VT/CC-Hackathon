import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import User from "@/models/User";
import { connectDB } from "@/config/db";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET. Add them to your .env.local file.",
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) {
        return "/login?error=user-not-found";
      }

      await connectDB();
      const dbUser = await User.findOne({ email: user.email }).lean();

      if (!dbUser) {
        return "/login?error=user-not-found";
      }

      return true;
    },
    // Only query the DB on the first sign-in (when `user` is truthy).
    // Subsequent requests use the data already cached in the JWT token,
    // avoiding a DB round-trip on every authenticated API call.
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in: hydrate the token from the DB once.
        await connectDB();
        const dbUser = await User.findOne({ email: user.email }).lean();
        if (dbUser) {
          token.email = user.email;
          token.role = (dbUser as any).role;
          token.team_id = (dbUser as any).team_id?.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.team_id = token.team_id as string | undefined;
      }
      return session;
    },
  },
};
