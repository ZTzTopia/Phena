"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@phena/ui/components/sidebar";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { NavFlat, NavCollapsible, type NavSubItem } from "@/components/nav-items";

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavSubItem[];
  isActive?: boolean;
};

export function AdminNavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className="gap-0.5">
          {items.map((item) =>
            item.items?.length ? (
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
