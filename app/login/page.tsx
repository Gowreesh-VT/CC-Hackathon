import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";
import { connectDB } from "@/config/db";
import User from "@/models/User";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    if (user && user.role === "team") {
      redirect("/team/dashboard");
    }
  }

  return <LoginClient />;
}
