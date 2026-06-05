import {
  bigint,
  bigserial,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { teams } from "./teams";

export const sshConfigs = pgTable(
  "ssh_configs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    teamId: bigint("team_id", { mode: "number" }).references(() => teams.id),
    isDefault: boolean("is_default").notNull().default(false),

    host: text("host").notNull(),
    port: integer("port").notNull().default(22),
    sshKey: text("ssh_key").notNull(),
    sshUser: text("ssh_user").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("ssh_configs_team_id_idx").on(table.teamId),
    index("ssh_configs_created_at_idx").on(table.createdAt),
  ],
);

export type SshConfig = typeof sshConfigs.$inferSelect;
export type NewSshConfig = typeof sshConfigs.$inferInsert;
