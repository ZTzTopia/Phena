import { notifications, type NewNotification } from "@api/db/schema/notifications";
import { Effect } from "effect";
import { Db } from "../db";

export abstract class NotificationRepository {
  static create(data: NewNotification) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db.insert(notifications).values(data).returning();
          return result[0] ?? null;
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findForPublicId(publicId: string, limit = 50) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () =>
          env.db.query.notifications.findMany({
            where: {
              OR: [{ teamId: { isNull: true } }, { team: { publicId } }],
            },
            orderBy: { createdAt: "desc" },
            limit,
          }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }
}
