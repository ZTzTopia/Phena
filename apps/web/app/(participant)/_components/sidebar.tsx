"use client";

import type { Role } from "@phena/schema";
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
import Link from "next/link";
import { Bell, Chart, Circle, Flag, MapPin, Settings2, Sword } from "pixelarticons/react";
import { useAuth } from "@/app/auth-provider";
import { ParticipantNavMain } from "./nav-main";
import { ParticipantNavSecondary } from "./nav-secondary";
import { ParticipantNavUser } from "./nav-user";

const data = {
  navMain: [
    {
      title: "Contest",
      url: "/contest",
      icon: Circle,
      requireRole: "team" as Role,
    },
    {
      title: "Quests",
      url: "/contest/quests",
      icon: Sword,
      requireRole: "team" as Role,
    },
    {
      title: "Battle Map",
      url: "/contest/battle-map",
      icon: MapPin,
    },
    {
      title: "Rankings",
      url: "/contest/rankings",
      icon: Chart,
    },
    {
      title: "Notifications",
      url: "/contest/notifications",
      icon: Bell,
      requireRole: "team" as Role,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/contest/settings",
      icon: Settings2,
    },
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

export function ParticipantSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { team } = useAuth();

  const name = team?.name ?? "";
  const avatar = "";
  const initials = name ? getInitials(name) : "?";
  const role = (team?.role ?? "") as Role;
  const isTeam = role === "team";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/contest">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Flag />
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
        <ParticipantNavMain role={role} items={data.navMain} />
        {isTeam && <ParticipantNavSecondary items={data.navSecondary} className="mt-auto" />}
      </SidebarContent>
      {isTeam && (
        <SidebarFooter>
          <ParticipantNavUser user={{ name, avatar, initials }} />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
