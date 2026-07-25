"use client";

import { Spinner } from "@phena/ui/components/spinner";
import { QueryError } from "@/app/(admin)/_components/query-error";
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

export default function NotificationsPage() {
  const { notifications, isLoading, isError, refetch, markAllRead } = useNotifications();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isError) {
    return <QueryError onRetry={() => refetch()} message="Failed to load notifications" />;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-2 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">No notifications yet</p>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="border-border hover:bg-muted/50 flex flex-col gap-1 border-b pb-3"
            >
              <p className="text-sm leading-snug">{n.message}</p>
              <span className="text-muted-foreground text-xs">{relativeTime(n.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
