import { pgTable, integer, timestamp, bigserial, bigint, index } from "drizzle-orm/pg-core";
import { teams } from "./teams";

export const scoresPerTick = pgTable(
  "scores",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    teamId: bigint("team_id", { mode: "number" })
      .notNull()
      .references(() => teams.id),

    round: integer("round").notNull(),
    tick: integer("tick").notNull(),

    attackPoints: integer("attack_points").notNull().default(0),
    defensePoints: integer("defense_points").notNull().default(0),
    slaPoints: integer("sla_points").notNull().default(0),
    totalPoints: integer("total_points").notNull().default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("scores_team_id_idx").on(table.teamId),
    index("scores_round_tick_idx").on(table.round, table.tick),
  ],
);

export type ScorePerTick = typeof scoresPerTick.$inferSelect;
export type NewScorePerTick = typeof scoresPerTick.$inferInsert;
