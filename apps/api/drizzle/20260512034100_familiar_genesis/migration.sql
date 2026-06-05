CREATE INDEX "challenges_created_at_idx" ON "challenges" ("created_at");--> statement-breakpoint
CREATE INDEX "checker_results_created_at_idx" ON "checker_results" ("created_at");--> statement-breakpoint
CREATE INDEX "flags_created_at_idx" ON "flags" ("created_at");--> statement-breakpoint
CREATE INDEX "scores_created_at_idx" ON "scores" ("created_at");--> statement-breakpoint
CREATE INDEX "service_operations_created_at_idx" ON "service_operations" ("created_at");--> statement-breakpoint
CREATE INDEX "service_scores_created_at_idx" ON "service_scores" ("created_at");--> statement-breakpoint
CREATE INDEX "services_created_at_idx" ON "services" ("created_at");--> statement-breakpoint
CREATE INDEX "ssh_configs_created_at_idx" ON "ssh_configs" ("created_at");--> statement-breakpoint
CREATE INDEX "submissions_value_search_idx" ON "submissions" USING gin (to_tsvector('english', "value"));--> statement-breakpoint
CREATE INDEX "submissions_created_at_id_idx" ON "submissions" ("created_at","id");--> statement-breakpoint
CREATE INDEX "system_logs_created_at_idx" ON "system_logs" ("created_at");--> statement-breakpoint
CREATE INDEX "teams_created_at_idx" ON "teams" ("created_at");