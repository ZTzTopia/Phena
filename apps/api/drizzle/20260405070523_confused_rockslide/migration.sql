CREATE TYPE "checker_result_status" AS ENUM('up', 'down', 'error');--> statement-breakpoint
CREATE TYPE "config_type" AS ENUM('string', 'number', 'boolean', 'json', 'date');--> statement-breakpoint
CREATE TYPE "service_operation_status" AS ENUM('pending', 'success', 'failed');--> statement-breakpoint
CREATE TYPE "service_operation_type" AS ENUM('provision', 'reset', 'restart');--> statement-breakpoint
CREATE TYPE "submission_status" AS ENUM('incorrect', 'correct', 'already_submitted', 'self_submitted');--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" bigserial PRIMARY KEY,
	"public_id" text NOT NULL UNIQUE,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text,
	"num_flags" integer DEFAULT 1 NOT NULL,
	"release_round" integer DEFAULT 1 NOT NULL,
	"file_path" text,
	"file_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checker_results" (
	"id" bigserial PRIMARY KEY,
	"service_id" bigint NOT NULL,
	"round" integer NOT NULL,
	"tick" integer NOT NULL,
	"status" "checker_result_status" NOT NULL,
	"message" text,
	"latency" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "config_store" (
	"id" text PRIMARY KEY,
	"config_json" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "config" (
	"key" text PRIMARY KEY,
	"type" "config_type" NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flags" (
	"id" bigserial PRIMARY KEY,
	"service_id" bigint NOT NULL,
	"round" integer NOT NULL,
	"tick" integer NOT NULL,
	"flag_index" integer DEFAULT 0 NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" bigserial PRIMARY KEY,
	"team_id" bigint NOT NULL,
	"round" integer NOT NULL,
	"tick" integer NOT NULL,
	"attack_points" integer DEFAULT 0 NOT NULL,
	"defense_points" integer DEFAULT 0 NOT NULL,
	"sla_points" integer DEFAULT 0 NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_operations" (
	"id" bigserial PRIMARY KEY,
	"service_id" bigint NOT NULL,
	"admin_id" bigint NOT NULL,
	"type" "service_operation_type" NOT NULL,
	"status" "service_operation_status" DEFAULT 'pending'::"service_operation_status" NOT NULL,
	"result_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_scores" (
	"id" bigserial PRIMARY KEY,
	"team_id" bigint NOT NULL,
	"service_id" bigint NOT NULL,
	"round" integer NOT NULL,
	"tick" integer NOT NULL,
	"attack_points" integer DEFAULT 0 NOT NULL,
	"defense_points" integer DEFAULT 0 NOT NULL,
	"sla_points" integer DEFAULT 0 NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" bigserial PRIMARY KEY,
	"team_id" bigint NOT NULL,
	"challenge_id" bigint NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"host" text,
	"port" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ssh_configs" (
	"id" bigserial PRIMARY KEY,
	"team_id" bigint,
	"is_default" boolean DEFAULT false NOT NULL,
	"host" text NOT NULL,
	"port" integer DEFAULT 22 NOT NULL,
	"ssh_key" text NOT NULL,
	"ssh_user" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" bigserial PRIMARY KEY,
	"team_id" bigint NOT NULL,
	"flag_id" bigint,
	"round" integer NOT NULL,
	"tick" integer NOT NULL,
	"value" text NOT NULL,
	"status" "submission_status" DEFAULT 'incorrect'::"submission_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"id" bigserial PRIMARY KEY,
	"team_id" bigserial,
	"round" integer,
	"tick" integer,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" bigserial PRIMARY KEY,
	"public_id" text NOT NULL UNIQUE,
	"name" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"role" text DEFAULT 'team' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "challenges_public_id_idx" ON "challenges" ("public_id");--> statement-breakpoint
CREATE INDEX "checker_results_service_id_idx" ON "checker_results" ("service_id");--> statement-breakpoint
CREATE INDEX "checker_results_round_tick_idx" ON "checker_results" ("round","tick");--> statement-breakpoint
CREATE UNIQUE INDEX "flags_unique_idx" ON "flags" ("service_id","flag_index","round","tick");--> statement-breakpoint
CREATE INDEX "scores_team_id_idx" ON "scores" ("team_id");--> statement-breakpoint
CREATE INDEX "scores_round_tick_idx" ON "scores" ("round","tick");--> statement-breakpoint
CREATE INDEX "service_operations_service_id_idx" ON "service_operations" ("service_id");--> statement-breakpoint
CREATE INDEX "service_operations_admin_id_idx" ON "service_operations" ("admin_id");--> statement-breakpoint
CREATE INDEX "service_operations_status_idx" ON "service_operations" ("status");--> statement-breakpoint
CREATE INDEX "service_scores_team_id_idx" ON "service_scores" ("team_id");--> statement-breakpoint
CREATE INDEX "service_scores_service_id_idx" ON "service_scores" ("service_id");--> statement-breakpoint
CREATE INDEX "service_scores_round_tick_idx" ON "service_scores" ("round","tick");--> statement-breakpoint
CREATE INDEX "services_team_id_idx" ON "services" ("team_id");--> statement-breakpoint
CREATE INDEX "services_challenge_id_idx" ON "services" ("challenge_id");--> statement-breakpoint
CREATE INDEX "services_status_idx" ON "services" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "ssh_configs_team_id_idx" ON "ssh_configs" ("team_id");--> statement-breakpoint
CREATE INDEX "submissions_team_id_idx" ON "submissions" ("team_id");--> statement-breakpoint
CREATE INDEX "submissions_flag_id_idx" ON "submissions" ("flag_id");--> statement-breakpoint
CREATE INDEX "submissions_round_tick_idx" ON "submissions" ("round","tick");--> statement-breakpoint
CREATE INDEX "submissions_status_idx" ON "submissions" ("status");--> statement-breakpoint
CREATE INDEX "system_logs_team_id_idx" ON "system_logs" ("team_id");--> statement-breakpoint
CREATE INDEX "system_logs_round_tick_idx" ON "system_logs" ("round","tick");--> statement-breakpoint
CREATE INDEX "system_logs_type_idx" ON "system_logs" ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "teams_public_id_idx" ON "teams" ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "teams_name_idx" ON "teams" ("name");--> statement-breakpoint
ALTER TABLE "checker_results" ADD CONSTRAINT "checker_results_service_id_services_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id");--> statement-breakpoint
ALTER TABLE "flags" ADD CONSTRAINT "flags_service_id_services_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id");--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_team_id_teams_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id");--> statement-breakpoint
ALTER TABLE "service_operations" ADD CONSTRAINT "service_operations_service_id_services_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id");--> statement-breakpoint
ALTER TABLE "service_operations" ADD CONSTRAINT "service_operations_admin_id_teams_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "teams"("id");--> statement-breakpoint
ALTER TABLE "service_scores" ADD CONSTRAINT "service_scores_team_id_teams_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id");--> statement-breakpoint
ALTER TABLE "service_scores" ADD CONSTRAINT "service_scores_service_id_services_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id");--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_team_id_teams_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id");--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_challenge_id_challenges_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id");--> statement-breakpoint
ALTER TABLE "ssh_configs" ADD CONSTRAINT "ssh_configs_team_id_teams_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id");--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_team_id_teams_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id");--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_flag_id_flags_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "flags"("id");--> statement-breakpoint
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_team_id_teams_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id");