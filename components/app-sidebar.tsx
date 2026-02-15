"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { navConfig, Role } from "@/lib/nav-config";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    // Fallback to determine role from pathname if session role is missing (for development/testing)
    // In production, session.user.role should be reliable
    const role: Role =
        session?.user?.role ||
        (pathname.startsWith("/admin")
            ? "admin"
            : pathname.startsWith("/judge")
                ? "judge"
                : "team");

    const items = navConfig[role] || [];

    return (
        <Sidebar>
            <SidebarHeader className="border-b p-4">
                <h2 className="text-lg font-semibold tracking-tight capitalize">
                    {role} Portal
                </h2>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                                        <a href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}
