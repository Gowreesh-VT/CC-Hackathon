import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

type JudgeLayoutProps = {
  children: React.ReactNode;
};

export default async function JudgeLayout({ children }: JudgeLayoutProps) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session) {
    redirect("/login");
  }

  if (role && role !== "judge") {
    redirect("/login");
  }

  return <>{children}</>;
}
