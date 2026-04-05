"use client";

import type { Role } from "@phena/schema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@phena/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@phena/ui/components/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "pixelarticons/react";
import * as React from "react";

export function ParticipantNavMain({
  role,
  items,
}: {
  role: Role;
  items: {
    title: string;
    url: string;
    icon?: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
    items?: {
      title: string;
      url: string;
      isActive?: boolean;
      requireRole?: Role;
    }[];
    isActive?: boolean;
    requireRole?: Role;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            const isActive = pathname === item.url;
            const hasActiveSubItem = item.items?.some((subItem) => pathname === subItem.url);
            const [isOpen, setIsOpen] = React.useState(item.isActive || hasActiveSubItem);
            const isDisabled = item.requireRole && role !== item.requireRole;

            if (isDisabled) {
              return null;
            }

            return (
              <Collapsible
                key={item.title}
                asChild
                open={isOpen}
                onOpenChange={setIsOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    onClick={() => setIsOpen((prev) => !prev)}
                    asChild
                  >
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                          <ChevronRight />
                          <span className="sr-only">Toggle</span>
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="gap-0.5">
                          {item.items.map((subItem) => {
                            const isSubActive = pathname === subItem.url;
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                  <Link href={subItem.url}>{subItem.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
