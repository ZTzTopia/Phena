"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@phena/ui/components/collapsible";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@phena/ui/components/sidebar";
import Link from "next/link";
import { useState, type ElementType } from "react";

export type NavSubItem = {
  title: string;
  url: string;
  isActive?: boolean;
};

export function NavFlat({
  title,
  url,
  Icon,
  pathname,
}: {
  title: string;
  url: string;
  Icon?: ElementType;
  pathname: string;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={title} isActive={pathname === url} asChild>
        <Link href={url}>
          {Icon && <Icon />}
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavCollapsible({
  title,
  url,
  Icon,
  isActive,
  subItems,
  pathname,
  ChevronIcon,
}: {
  title: string;
  url: string;
  Icon?: ElementType;
  isActive?: boolean;
  subItems: NavSubItem[];
  pathname: string;
  ChevronIcon: ElementType;
}) {
  const [isOpen, setIsOpen] = useState(
    isActive || subItems.some((sub) => pathname === sub.url),
  );

  return (
    <Collapsible
      asChild
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={title}
          isActive={pathname === url}
          onClick={() => setIsOpen((prev) => !prev)}
          asChild
        >
          <Link href={url}>
            {Icon && <Icon />}
            <span>{title}</span>
          </Link>
        </SidebarMenuButton>
        <CollapsibleTrigger asChild>
          <SidebarMenuAction className="data-[state=open]:rotate-90">
            <ChevronIcon />
            <span className="sr-only">Toggle</span>
          </SidebarMenuAction>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="gap-0.5">
            {subItems.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                  <Link href={subItem.url}>{subItem.title}</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
