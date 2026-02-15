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

// Mock function to determine role based on email
// In a real application, you would fetch this from your database
const getRoleForEmail = (email: string): "admin" | "judge" | "team" => {
  if (email.includes("admin") || email.endsWith("@org.admin")) return "admin";
  if (email.includes("judge") || email.endsWith("@org.judge")) return "judge";
  return "team"; // Default role
};

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
        token.role = getRoleForEmail(user.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
};
