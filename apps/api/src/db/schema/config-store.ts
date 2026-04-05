import { pgTable, jsonb, text, timestamp } from "drizzle-orm/pg-core";

export const configStore = pgTable("config_store", {
  id: text("id").primaryKey(),
  configJson: jsonb("config_json").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ConfigStore = typeof configStore.$inferSelect;
export type NewConfigStore = typeof configStore.$inferInsert;
