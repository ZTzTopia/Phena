import {
  bigint,
  bigserial,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { services } from "./services";

export const flags = pgTable(
  "flags",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    serviceId: bigint("service_id", { mode: "number" })
      .notNull()
      .references(() => services.id),

    round: integer("round").notNull(),
    tick: integer("tick").notNull(),

    index: integer("flag_index").notNull().default(0),
    value: text("value").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("flags_unique_idx").on(table.serviceId, table.index, table.round, table.tick),
  ],
);

export type Flag = typeof flags.$inferSelect;
export type NewFlag = typeof flags.$inferInsert;
