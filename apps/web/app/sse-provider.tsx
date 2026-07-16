"use client";

import { type SSEEvent, SSEEventType } from "@phena/schema";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type EventCallback = (event: SSEEvent) => void;

type SSEConnectionState = "connecting" | "connected" | "disconnected" | "error";

interface SSEContextValue {
  connectionState: SSEConnectionState;
  subscribe: (eventTypes: SSEEventType[], callback: EventCallback) => () => void;
  error: Error | null;
}

const SSEContext = createContext<SSEContextValue | null>(null);

function getSSEUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return `${apiUrl}/api/events`;
}

export function SSEProvider({ children }: { children: ReactNode }) {
  const [connectionState, setConnectionState] = useState<SSEConnectionState>("disconnected");
  const [error, setError] = useState<Error | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const subscribersRef = useRef<Map<string, Set<EventCallback>>>(new Map());

  const subscribe = useCallback((eventTypes: SSEEventType[], callback: EventCallback): (() => void) => {
    const unsubscribers: (() => void)[] = [];

    for (const type of eventTypes) {
      if (!subscribersRef.current.has(type)) {
        subscribersRef.current.set(type, new Set());
      }

      subscribersRef.current.get(type)!.add(callback);
      unsubscribers.push(() => {
        subscribersRef.current.get(type)?.delete(callback);
      });
    }

    return () => {
      for (const unsub of unsubscribers) {
        unsub();
      }
    };
  }, []);

  useEffect(() => {
    const url = getSSEUrl();
    setConnectionState("connecting");
    setError(null);

    const eventSource = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnectionState("connected");
      setError(null);
    };

    eventSource.onerror = () => {
      const err = new Error("SSE connection error");
      setError(err);
      setConnectionState("error");

      if (eventSource.readyState === EventSource.CLOSED) {
        eventSourceRef.current = null;
        setConnectionState("disconnected");
      }
    };

    const eventTypes: SSEEventType[] = [
      SSEEventType.Connected,
      SSEEventType.Notification,
      SSEEventType.Activity,
      SSEEventType.Scoreboard,
      SSEEventType.Tick,
      SSEEventType.ServiceStatus,
      SSEEventType.ConfigChange,
      SSEEventType.Log,
    ];

    const listeners = eventTypes.map((type) => ({
      type,
      handler: (e: MessageEvent) => {
        try {
          const event = JSON.parse(e.data) as SSEEvent;
          const typedEvent = { ...event, type } as SSEEvent;

          const callbacks = subscribersRef.current.get(type);
          callbacks?.forEach((cb) => cb(typedEvent));
        } catch {
          // Silently ignore parse errors
        }
      },
    }));

    for (const { type, handler } of listeners) {
      eventSource.addEventListener(type, handler);
    }

    return () => {
      for (const { type, handler } of listeners) {
        eventSource.removeEventListener(type, handler);
      }

      eventSource.close();
      eventSourceRef.current = null;
      setConnectionState("disconnected");
    };
  }, []);

  return (
    <SSEContext.Provider value={{ connectionState, subscribe, error }}>
      {children}
    </SSEContext.Provider>
  );
}

export function useSSEContext() {
  const context = useContext(SSEContext);
  if (!context) {
    throw new Error("useSSEContext must be used within SSEProvider");
  }

  return context;
}

type UseSSEOptions = {
  enabled?: boolean;
  onEvent?: (event: SSEEvent) => void;
  invalidateQueries?: Partial<Record<SSEEventType, string[]>>;
};

export function useSSE(eventTypes: SSEEventType[], options: UseSSEOptions = {}) {
  const { enabled = true, onEvent, invalidateQueries } = options;
  const { subscribe, connectionState, error } = useSSEContext();
  const queryClient = useQueryClient();
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const invalidateRef = useRef(invalidateQueries);
  invalidateRef.current = invalidateQueries;

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribe(eventTypes, (event) => {
      onEventRef.current?.(event);

      const inv = invalidateRef.current;
      if (inv?.[event.type]) {
        const queryKeys = inv[event.type]!;
        for (const key of queryKeys) {
          queryClient.invalidateQueries({ queryKey: [key] });
        }
      }
    });

    return unsubscribe;
    // ponytail: eventTypes is stable per-call site (module-scope enums), subscribe/queryClient stable from context
  }, [enabled, eventTypes, subscribe, queryClient]);

  return { connectionState, error };
}

export function useSSEConnection() {
  const { connectionState, error } = useSSEContext();
  return { connectionState, error };
}
