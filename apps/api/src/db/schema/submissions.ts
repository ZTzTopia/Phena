import {
  bigint,
  bigserial,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { flags } from "./flags";
import { teams } from "./teams";

export const submissionStatusEnum = pgEnum("submission_status", [
  "incorrect",
  "correct",
  "already_submitted",
  "self_submitted",
]);

export const submissions = pgTable(
  "submissions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    teamId: bigint("team_id", { mode: "number" })
      .notNull()
      .references(() => teams.id),
    flagId: bigint("flag_id", { mode: "number" }).references(() => flags.id),

    round: integer("round").notNull(),
    tick: integer("tick").notNull(),

    value: text("value").notNull(),
    status: submissionStatusEnum("status").notNull().default("incorrect"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("submissions_team_id_idx").on(table.teamId),
    index("submissions_flag_id_idx").on(table.flagId),
    index("submissions_round_tick_idx").on(table.round, table.tick),
    index("submissions_status_idx").on(table.status),
  ],
);

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
