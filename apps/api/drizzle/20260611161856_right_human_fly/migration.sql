ALTER TABLE "checker_results" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "flags" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "scores" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "service_operations" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "service_scores" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "system_logs" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
DROP INDEX "flags_unique_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "flags_unique_idx" ON "flags" ("service_id","flag_index","round","tick") WHERE "deleted_at" IS NULL;