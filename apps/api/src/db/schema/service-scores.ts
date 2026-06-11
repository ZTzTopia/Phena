import { pgTable, integer, timestamp, bigserial, bigint, index } from "drizzle-orm/pg-core";
import { services } from "./services";
import { teams } from "./teams";

export const serviceScoresPerTick = pgTable(
  "service_scores",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    teamId: bigint("team_id", { mode: "number" })
      .notNull()
      .references(() => teams.id),
    serviceId: bigint("service_id", { mode: "number" })
      .notNull()
      .references(() => services.id),

    round: integer("round").notNull(),
    tick: integer("tick").notNull(),

    attackPoints: integer("attack_points").notNull().default(0),
    defensePoints: integer("defense_points").notNull().default(0),
    slaPoints: integer("sla_points").notNull().default(0),
    totalPoints: integer("total_points").notNull().default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("service_scores_team_id_idx").on(table.teamId),
    index("service_scores_service_id_idx").on(table.serviceId),
    index("service_scores_round_tick_idx").on(table.round, table.tick),
    index("service_scores_created_at_idx").on(table.createdAt),
  ],
);

export type ServiceScorePerTick = typeof serviceScoresPerTick.$inferSelect;
export type NewServiceScorePerTick = typeof serviceScoresPerTick.$inferInsert;
