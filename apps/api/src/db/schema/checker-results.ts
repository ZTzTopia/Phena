import {
  pgTable,
  text,
  integer,
  timestamp,
  real,
  bigserial,
  bigint,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { services } from "./services";

export const checkerResultStatusEnum = pgEnum("checker_result_status", ["up", "down", "error"]);

export const checkerResults = pgTable(
  "checker_results",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    serviceId: bigint("service_id", { mode: "number" })
      .notNull()
      .references(() => services.id),

    round: integer("round").notNull(),
    tick: integer("tick").notNull(),

    status: checkerResultStatusEnum("status").notNull(),
    message: text("message"),
    latency: real("latency"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("checker_results_service_id_idx").on(table.serviceId),
    index("checker_results_round_tick_idx").on(table.round, table.tick),
  ],
);

export type CheckerResult = typeof checkerResults.$inferSelect;
export type NewCheckerResult = typeof checkerResults.$inferInsert;
