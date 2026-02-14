import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

type TeamLayoutProps = {
  children: React.ReactNode;
};

export default async function TeamLayout({ children }: TeamLayoutProps) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session) {
    redirect("/login");
  }

  if (role && role !== "team") {
    redirect("/login");
  }

  return <>{children}</>;
}
