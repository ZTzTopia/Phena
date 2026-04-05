import { Effect } from "effect";

export const EventChannels = {
  Global: "phena:events",
  Team: (teamId: string) => `phena:team:${teamId}`,
} as const;

export type EventType =
  | "notification"
  | "activity"
  | "scoreboard"
  | "tick"
  | "service_status"
  | "config_change"
  | "log"
  | "ping"
  | "connected";

export interface Event {
  type: EventType;
  data: unknown;
  timestamp: number;
}

type StreamWriter = (event: Event) => void;

interface ChannelState {
  streams: Set<StreamWriter>;
  unsubscribe: (() => void) | null;
  refCount: number;
}

const makeChannelState = (): ChannelState => ({
  streams: new Set(),
  unsubscribe: null,
  refCount: 0,
});

const channelRegistry = new Map<string, ChannelState>([[EventChannels.Global, makeChannelState()]]);

const handleMessage = (channel: string, msg: string) => {
  const state = channelRegistry.get(channel);
  if (!state) return;

  let parsedEvent: Event;
  try {
    parsedEvent = JSON.parse(msg) as Event;
  } catch {
    parsedEvent = { type: "log", data: msg, timestamp: Date.now() };
  }

  for (const writer of state.streams) {
    try {
      writer(parsedEvent);
    } catch {
      state.streams.delete(writer);
    }
  }
};

const startSubscription = (channel: string, state: ChannelState): void => {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const subscriber = new (require("ioredis"))(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  subscriber.once("error", (err: Error) => {
    console.error(`Redis subscriber error for ${channel}:`, err);
  });

  subscriber.subscribe(channel);
  subscriber.once("subscribe", () => {
    console.log(`Subscribed to Redis channel: ${channel}`);
  });

  subscriber.on("message", (ch: string, msg: string) => {
    handleMessage(ch, msg);
  });

  state.unsubscribe = () => {
    subscriber.unsubscribe(channel);
    subscriber.disconnect();
  };
};

export namespace EventManager {
  export const addStream: (channel: string, writer: StreamWriter) => Effect.Effect<void, Error> = (
    channel,
    writer,
  ) =>
    Effect.gen(function* () {
      let state = channelRegistry.get(channel);
      if (!state) {
        state = makeChannelState();
        channelRegistry.set(channel, state);
      }

      state.streams.add(writer);
      state.refCount++;

      if (state.refCount > 1 && state.unsubscribe) {
        yield* Effect.void;
        return;
      }

      startSubscription(channel, state);
    });

  export const removeStream: (
    channel: string,
    writer: StreamWriter,
  ) => Effect.Effect<void, Error> = (channel, writer) =>
    Effect.gen(function* () {
      const state = channelRegistry.get(channel);
      if (!state) {
        yield* Effect.void;
        return;
      }

      state.streams.delete(writer);
      state.refCount--;

      if (state.refCount > 0) {
        yield* Effect.void;
        return;
      }

      if (state.unsubscribe) {
        state.unsubscribe();
        state.unsubscribe = null;
      }
    });

  export const forChannel: (channel: string) => Effect.Effect<ReadonlySet<StreamWriter>, Error> = (
    channel,
  ) =>
    Effect.gen(function* () {
      const state = channelRegistry.get(channel);
      if (!state) return new Set();
      yield* Effect.void;
      return state.streams;
    });
}
