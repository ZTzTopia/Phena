import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const configTypeEnum = pgEnum("config_type", [
  "string",
  "number",
  "boolean",
  "json",
  "date",
]);

export const config = pgTable("config", {
  key: text("key").primaryKey(),
  type: configTypeEnum("type").notNull(),
  value: text("value").notNull(),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Config = typeof config.$inferSelect;
export type NewConfig = typeof config.$inferInsert;
export type ConfigType = (typeof configTypeEnum.enumValues)[number];
