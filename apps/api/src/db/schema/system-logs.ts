import { pgTable, text, timestamp, bigserial, integer, index } from "drizzle-orm/pg-core";
import { teams } from "./teams";

export const systemLogs = pgTable(
  "system_logs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    teamId: bigserial("team_id", { mode: "number" }).references(() => teams.id),

    round: integer("round"),
    tick: integer("tick"),

    type: text("type", { enum: ["info", "success", "error"] }).notNull(),
    message: text("message").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("system_logs_team_id_idx").on(table.teamId),
    index("system_logs_round_tick_idx").on(table.round, table.tick),
    index("system_logs_type_idx").on(table.type),
  ],
);

export type SystemLog = typeof systemLogs.$inferSelect;
export type NewSystemLog = typeof systemLogs.$inferInsert;
