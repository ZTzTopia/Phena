"use client";

import type { Role } from "@phena/schema";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@phena/ui/components/sidebar";
import { ChevronRight } from "pixelarticons/react";
import { usePathname } from "next/navigation";
import { type ElementType } from "react";
import { NavFlat, NavCollapsible, type NavSubItem } from "@/components/nav-items";

type NavIcon = ElementType;

type SubItem = NavSubItem;

type NavItem = {
  title: string;
  url: string;
  icon?: NavIcon;
  items?: SubItem[];
  isActive?: boolean;
  requireRole?: Role;
};

export function ParticipantNavMain({
  role,
  items,
}: {
  role: Role;
  items: NavItem[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className="gap-0.5">
          {items.map((item) =>
            item.requireRole && role !== item.requireRole ? null : item.items?.length ? (
              <NavCollapsible
                key={item.title}
                title={item.title}
                url={item.url}
                Icon={item.icon}
                isActive={item.isActive}
                subItems={item.items}
                pathname={pathname}
                ChevronIcon={ChevronRight}
              />
            ) : (
              <NavFlat
                key={item.title}
                title={item.title}
                url={item.url}
                Icon={item.icon}
                pathname={pathname}
              />
            ),
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
