"use client";

import { type NotificationModel as NM, SSEEventType } from "@phena/schema";
import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { useCallback, useMemo } from "react";
import { useSSE } from "@/app/sse-provider";
import { client } from "@/lib/api-client";

const READ_IDS_KEY = "phena:read-ids";

function getReadIds(): Set<number> {
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    return new Set<number>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: number[]) {
  localStorage.setItem(READ_IDS_KEY, JSON.stringify(ids));
}

export function useNotifications() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await parseResponse(client.api.notifications.$get());
      return res as NM["listResponse"];
    },
    placeholderData: (prev) => prev,
  });

  useSSE([SSEEventType.Notification], {
    invalidateQueries: { [SSEEventType.Notification]: ["notifications"] },
  });

  const notifications = data?.notifications ?? [];

  const unreadCount = useMemo(() => {
    const readIds = getReadIds();
    return notifications.filter((n) => !readIds.has(n.id)).length;
  }, [notifications]);

  const markRead = useCallback((id: number) => {
    const readIds = getReadIds();
    readIds.add(id);
    saveReadIds([...readIds]);
  }, []);

  const markAllRead = useCallback(() => {
    const ids = notifications.map((n) => n.id);
    saveReadIds(ids);
  }, [notifications]);

  return { notifications, isLoading, isError, refetch, unreadCount, markRead, markAllRead };
}
