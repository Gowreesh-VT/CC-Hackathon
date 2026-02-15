import SidebarLayout from "@/components/sidebar-layout";

export default function JudgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
