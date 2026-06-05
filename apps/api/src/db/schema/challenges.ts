import {
  pgTable,
  text,
  integer,
  timestamp,
  bigserial,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const challenges = pgTable(
  "challenges",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: text("public_id")
      .notNull()
      .unique()
      .$default(() => nanoid()),

    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category"),

    numFlags: integer("num_flags").notNull().default(1),
    releaseRound: integer("release_round").notNull().default(1),

    filePath: text("file_path"),
    fileHash: text("file_hash"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("challenges_public_id_idx").on(table.publicId),
    index("challenges_created_at_idx").on(table.createdAt),
  ],
);

export type Challenge = typeof challenges.$inferSelect;
export type NewChallenge = typeof challenges.$inferInsert;
