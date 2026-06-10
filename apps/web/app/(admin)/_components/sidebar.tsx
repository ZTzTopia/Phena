"use client";

import type * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@phena/ui/components/sidebar";
import { LayoutDashboard, Settings, GalleryVerticalEnd, Gamepad } from "lucide-react";
import Link from "next/link";
import { AdminNavUser } from "@/app/(admin)/_components/nav-user";
import { useAuth } from "@/app/auth-provider";
import { AdminNavMain } from "./nav-main";
import { AdminNavSecondary } from "./nav-secondary";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Leaderboard",
      url: "/admin/leaderboard",
      icon: GalleryVerticalEnd,
    },
    {
      title: "Game Management",
      url: "#",
      icon: Gamepad,
      items: [
        { title: "Challenges", url: "/admin/challenges" },
        { title: "Teams", url: "/admin/teams" },
        { title: "Services", url: "/admin/services" },
        { title: "Submissions", url: "/admin/submissions" },
        { title: "System Logs", url: "/admin/system-logs" },
      ],
    },
    {
      title: "Config",
      url: "/admin/config",
      icon: Settings,
    },
  ],
  navSecondary: [
    // {
    //   title: "Settings",
    //   url: "/admin/settings",
    //   icon: Settings,
    // },
  ],
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { team } = useAuth();

  const name = team?.name ?? "";
  const avatar = "";
  const initials = name ? getInitials(name) : "?";

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Phena</span>
                  <span className="">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AdminNavMain items={data.navMain} />
        <AdminNavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <AdminNavUser user={{ name, avatar, initials }} />
      </SidebarFooter>
    </Sidebar>
  );
}
