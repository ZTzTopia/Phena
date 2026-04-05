import { challenges } from "@api/db/schema/challenges";
import { checkerResults, type NewCheckerResult } from "@api/db/schema/checker-results";
import { serviceOperations } from "@api/db/schema/service-operations";
import { services, type NewService } from "@api/db/schema/services";
import { teams } from "@api/db/schema/teams";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { Db } from "../db";

export interface EnrichedService {
  id: number;
  teamId: number;
  teamName: string | null;
  challengeId: number;
  challengeTitle: string | null;
  status: "up" | "down" | "pending";
  host: string | null;
  port: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class ServiceRepository {
  static findAll() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () =>
          env.db.query.services.findMany({
            orderBy: (service, { asc }) => [asc(service.createdAt)],
            with: {
              team: true,
              challenge: true,
            },
          }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findById(id: number) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () =>
          env.db.query.services.findFirst({
            where: {
              id,
            },
            with: {
              team: true,
              challenge: true,
            },
          }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findByTeamId(teamId: number) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () =>
          env.db.query.services.findMany({
            where: {
              teamId,
            },
            with: {
              team: true,
              challenge: true,
            },
          }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findByChallengeId(challengeId: number) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () =>
          env.db.query.services.findMany({
            where: {
              challengeId,
            },
            with: {
              team: true,
              challenge: true,
            },
          }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static create(data: NewService) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db.insert(services).values(data).returning({
            id: services.id,
            teamId: services.teamId,
            challengeId: services.challengeId,
            status: services.status,
            host: services.host,
            port: services.port,
            createdAt: services.createdAt,
            updatedAt: services.updatedAt,
          });
          return result[0];
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static createOperation(data: {
    serviceId: number;
    adminId: number;
    type: "provision" | "reset" | "restart";
  }) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db.insert(serviceOperations).values(data).returning();
          return result[0];
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static createCheckerResult(data: NewCheckerResult) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db.insert(checkerResults).values(data).returning();
          return result[0];
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static updateStatusFromChecker(serviceId: number, checkerStatus: "up" | "down" | "error") {
    const status = checkerStatus === "error" ? "down" : checkerStatus;
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db
            .update(services)
            .set({ status })
            .where(eq(services.id, serviceId))
            .returning({
              id: services.id,
              teamId: services.teamId,
              challengeId: services.challengeId,
              status: services.status,
              host: services.host,
              port: services.port,
              createdAt: services.createdAt,
              updatedAt: services.updatedAt,
            });
          return result[0];
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findMissingServices() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const existing = await env.db
            .select({
              teamId: services.teamId,
              challengeId: services.challengeId,
            })
            .from(services);

          const existingPairs = new Set(existing.map((s) => `${s.teamId}-${s.challengeId}`));

          const allTeams = await env.db.select({ id: teams.id, name: teams.name }).from(teams);
          const allChallenges = await env.db
            .select({ id: challenges.id, title: challenges.title })
            .from(challenges);

          const missing: {
            teamId: number;
            teamName: string | null;
            challengeId: number;
            challengeTitle: string | null;
          }[] = [];

          for (const team of allTeams) {
            for (const challenge of allChallenges) {
              const pairKey = `${team.id}-${challenge.id}`;
              if (!existingPairs.has(pairKey)) {
                missing.push({
                  teamId: team.id,
                  teamName: team.name,
                  challengeId: challenge.id,
                  challengeTitle: challenge.title,
                });
              }
            }
          }

          return missing;
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }
}
