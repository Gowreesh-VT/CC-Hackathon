import {
  LayoutDashboard,
  Users,
  Gavel,
  ListOrdered,
  FileText,
  Trophy,
} from "lucide-react";

export type Role = "admin" | "judge" | "team";

export interface SidebarNavItem {
  title: string;
  href: string;
  icon: any;
}

export const navConfig: Record<Role, SidebarNavItem[]> = {
  admin: [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Rounds",
      href: "/admin/rounds",
      icon: ListOrdered,
    },
    {
      title: "Teams",
      href: "/admin/teams",
      icon: Users,
    },
    {
      title: "Judges",
      href: "/admin/judges",
      icon: Gavel,
    },
  ],
  judge: [
    {
      title: "Dashboard",
      href: "/judge",
      icon: LayoutDashboard,
    },
    {
      title: "Rounds",
      href: "/judge/rounds",
      icon: ListOrdered,
    },
  ],
  team: [
    {
      title: "Dashboard",
      href: "/team",
      icon: LayoutDashboard,
    },
    {
      title: "Rounds",
      href: "/team/rounds",
      icon: ListOrdered,
    },
    {
      title: "Submissions",
      href: "/team/submissions",
      icon: FileText,
    },
  ],
};
