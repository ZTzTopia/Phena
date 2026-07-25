import { NotificationRepository } from "@api/repositories/notifications";
import { SSEEventType } from "@phena/schema";
import { Effect } from "effect";
import { RedisClient } from "../lib/redis";

export class NotificationService extends Effect.Service<NotificationService>()(
  "NotificationService",
  {
    effect: Effect.gen(function* () {
      const notify = (message: string, teamId?: number) =>
        Effect.gen(function* () {
          const notification = yield* NotificationRepository.create({
            message,
            teamId: teamId,
          });
          if (!notification) {
            return;
          }

          const payload = JSON.stringify({
            type: SSEEventType.Notification,
            data: { id: notification.id, message, teamId: teamId },
            timestamp: Date.now(),
          });

          const channel = teamId ? `phena:team:${teamId}` : "phena:events";
          yield* RedisClient.use((r) => r.publish(channel, payload));
        });

      const forPublicId = (publicId: string) => NotificationRepository.findForPublicId(publicId);

      yield* Effect.succeed(null);

      return { notify, forPublicId };
    }),
  },
) {}
