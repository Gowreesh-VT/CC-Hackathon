import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  console.warn(
    "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET. Add them to your environment.",
  );
}

// Fallback to avoid build errors if env vars are missing
const clientId = googleClientId || "dummy_client_id";
const clientSecret = googleClientSecret || "dummy_client_secret";

import User from "@/models/User";
import { connectDB } from "@/config/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: clientId,
      clientSecret: clientSecret,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });

        if (dbUser) {
          token.role = dbUser.role;
          token.team_id = dbUser.team_id?.toString();
        } else {
          token.role = "team";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.team_id = token.team_id;
      }
      return session;
    },
  },
};
