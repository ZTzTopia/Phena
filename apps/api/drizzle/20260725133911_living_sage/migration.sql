CREATE TABLE "notifications" (
	"id" bigserial PRIMARY KEY,
	"team_id" bigint,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "notifications_team_id_created_at_idx" ON "notifications" ("team_id","created_at");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_team_id_teams_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id");