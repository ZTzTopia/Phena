import { bigserial, index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const teams = pgTable(
  "teams",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: text("public_id")
      .notNull()
      .unique()
      .$default(() => nanoid()),

    name: text("name").notNull().unique(),
    // email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: text("role", { enum: ["admin", "team"] })
      .notNull()
      .default("team"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("teams_public_id_idx").on(table.publicId),
    uniqueIndex("teams_name_idx").on(table.name),
    index("teams_created_at_idx").on(table.createdAt),
  ],
);

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
