"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@phena/ui/components/8bit/dropdown-menu";
import Link from "next/link";
import { Bell } from "pixelarticons/react";
import { useCallback, useRef } from "react";
import { useNotifications } from "@/hooks/use-notifications";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const openRef = useRef(false);

  const recent = notifications.slice(0, 5);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      openRef.current = open;
      if (open) {
        for (const n of recent) {
          markRead(n.id);
        }
      }
    },
    [markRead, recent],
  );

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex size-8 items-center justify-center hover:opacity-80"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm font-medium">Notifications</span>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                markAllRead();
              }}
              className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="text-muted-foreground py-6 text-center text-xs">No notifications</div>
        ) : (
          <div className="flex max-h-60 flex-col overflow-y-auto">
            {recent.map((n) => (
              <div key={n.id} className="hover:bg-muted/50 flex flex-col gap-0.5 px-2 py-1.5">
                <p className="text-xs leading-snug">{n.message}</p>
                <span className="text-muted-foreground text-[10px]">
                  {relativeTime(n.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/contest/notifications" className="justify-center text-xs">
            View all &rarr;
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
