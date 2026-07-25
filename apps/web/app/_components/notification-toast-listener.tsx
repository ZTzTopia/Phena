"use client";

import { SSEEventType } from "@phena/schema";
import { toast } from "sonner";
import { useSSE } from "@/app/sse-provider";

export function NotificationToastListener() {
  useSSE([SSEEventType.Notification], {
    onEvent: (event) => {
      const d = event.data as { id: number; message: string };
      toast(d.message);
    },
  });

  return null;
}
