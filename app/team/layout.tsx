import SidebarLayout from "@/components/sidebar-layout";

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
