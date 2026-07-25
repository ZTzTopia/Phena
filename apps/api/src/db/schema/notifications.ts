import { bigint, bigserial, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { teams } from "./teams";

export const notifications = pgTable(
  "notifications",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    teamId: bigint("team_id", { mode: "number" }).references(() => teams.id),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("notifications_team_id_created_at_idx").on(table.teamId, table.createdAt)],
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
