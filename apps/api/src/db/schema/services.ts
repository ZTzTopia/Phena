import { bigint, bigserial, integer, pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { challenges } from "./challenges";
import { teams } from "./teams";

export const services = pgTable(
  "services",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    teamId: bigint("team_id", { mode: "number" })
      .notNull()
      .references(() => teams.id),
    challengeId: bigint("challenge_id", { mode: "number" })
      .notNull()
      .references(() => challenges.id),

    status: text("status", { enum: ["up", "down", "pending"] })
      .notNull()
      .default("pending"),
    host: text("host"),
    port: integer("port"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("services_team_id_idx").on(table.teamId),
    index("services_challenge_id_idx").on(table.challengeId),
    index("services_status_idx").on(table.status),
    index("services_created_at_idx").on(table.createdAt),
  ],
);

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
