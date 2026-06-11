import { challenges } from "@api/db/schema/challenges";
import { checkerResults, type NewCheckerResult } from "@api/db/schema/checker-results";
import { serviceOperations } from "@api/db/schema/service-operations";
import { services, type NewService } from "@api/db/schema/services";
import { teams } from "@api/db/schema/teams";
import { eq, isNull } from "drizzle-orm";
import { relationsFilterToSQL, sql } from "drizzle-orm";
import { Effect } from "effect";
import type { WhereClause } from "../db/types";
import { Db } from "../db";
import { getOffset, type PaginationParams } from "../lib/pagination";

export abstract class ServiceRepository {
  static findAll() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () =>
          env.db.query.services.findMany({
            where: { deletedAt: { isNull: true } },
            orderBy: (service, { asc }) => [asc(service.createdAt)],
            with: {
              team: { columns: { publicId: true, name: true } },
              challenge: { columns: { publicId: true, title: true } },
            },
          }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findAllPaginated({ page, limit, search }: PaginationParams) {
    const offset = getOffset(page, limit);
    return Effect.flatMap(Db, (env) => {
      const where: WhereClause<"services"> | undefined = search
        ? {
            OR: [
              { status: { ilike: `%${search}%` } },
              { host: { ilike: `%${search}%` } },
              { port: { eq: Number(search) } },
              {
                RAW: (table) =>
                  sql`${table.teamId} IN (SELECT id FROM teams WHERE name ILIKE ${"%" + search + "%"})`,
              },
              {
                RAW: (table) =>
                  sql`${table.challengeId} IN (SELECT id FROM challenges WHERE title ILIKE ${"%" + search + "%"})`,
              },
            ],
          }
        : undefined;

      const dataQuery = Effect.tryPromise(() =>
        env.db.query.services.findMany({
          where: where
            ? { AND: [{ deletedAt: { isNull: true } }, where] }
            : { deletedAt: { isNull: true } },
          orderBy: (service, { asc }) => [asc(service.createdAt)],
          with: {
            team: { columns: { publicId: true, name: true } },
            challenge: { columns: { publicId: true, title: true } },
          },
          limit,
          offset,
        }),
      );

      const totalQuery = Effect.tryPromise(() =>
        env.db.$count(
          services,
          where
            ? relationsFilterToSQL(services, { AND: [{ deletedAt: { isNull: true } }, where] })
            : relationsFilterToSQL(services, { deletedAt: { isNull: true } }),
        ),
      );

      return Effect.all([dataQuery, totalQuery]).pipe(
        Effect.map(([data, total]) => ({ data, total: Number(total ?? 0) })),
      );
    });
  }

  static findById(id: number) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () =>
          env.db.query.services.findFirst({
            where: {
              id,
              deletedAt: { isNull: true },
            },
            with: {
              team: { columns: { publicId: true, name: true } },
              challenge: { columns: { publicId: true, title: true } },
            },
          }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findByTeamId(teamId: number, { page, limit, search }: PaginationParams) {
    const offset = getOffset(page, limit);
    return Effect.flatMap(Db, (env) => {
      const where: WhereClause<"services"> = search
        ? {
            AND: [
              { teamId: { eq: teamId } },
              {
                OR: [
                  { status: { ilike: `%${search}%` } },
                  { host: { ilike: `%${search}%` } },
                  { port: { eq: Number(search) } },
                  {
                    RAW: (table) =>
                      sql`${table.challengeId} IN (SELECT id FROM challenges WHERE title ILIKE ${"%" + search + "%"})`,
                  },
                ],
              },
            ],
          }
        : { teamId: { eq: teamId } };

      const dataQuery = Effect.tryPromise(() =>
        env.db.query.services.findMany({
          where: { AND: [{ deletedAt: { isNull: true } }, where] },
          with: {
            team: { columns: { publicId: true, name: true } },
            challenge: { columns: { publicId: true, title: true } },
          },
          limit,
          offset,
        }),
      );

      const totalQuery = Effect.tryPromise(() =>
        env.db.$count(
          services,
          relationsFilterToSQL(services, { AND: [{ deletedAt: { isNull: true } }, where] }),
        ),
      );

      return Effect.all([dataQuery, totalQuery]).pipe(
        Effect.map(([data, total]) => ({ data, total: Number(total ?? 0) })),
      );
    });
  }

  static findByChallengeId(challengeId: number, { page, limit, search }: PaginationParams) {
    const offset = getOffset(page, limit);
    return Effect.flatMap(Db, (env) => {
      const where: WhereClause<"services"> = search
        ? {
            AND: [
              { challengeId: { eq: challengeId } },
              {
                OR: [
                  { status: { ilike: `%${search}%` } },
                  { host: { ilike: `%${search}%` } },
                  { port: { eq: Number(search) } },
                  {
                    RAW: (table) =>
                      sql`${table.teamId} IN (SELECT id FROM teams WHERE name ILIKE ${"%" + search + "%"})`,
                  },
                ],
              },
            ],
          }
        : { challengeId: { eq: challengeId } };

      const dataQuery = Effect.tryPromise(() =>
        env.db.query.services.findMany({
          where: { AND: [{ deletedAt: { isNull: true } }, where] },
          with: {
            team: { columns: { publicId: true, name: true } },
            challenge: { columns: { publicId: true, title: true } },
          },
          limit,
          offset,
        }),
      );

      const totalQuery = Effect.tryPromise(() =>
        env.db.$count(
          services,
          relationsFilterToSQL(services, { AND: [{ deletedAt: { isNull: true } }, where] }),
        ),
      );

      return Effect.all([dataQuery, totalQuery]).pipe(
        Effect.map(([data, total]) => ({ data, total: Number(total ?? 0) })),
      );
    });
  }

  static findAllWithChallengeDetail() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () =>
          env.db.query.services.findMany({
            where: { deletedAt: { isNull: true } },
            with: {
              challenge: {
                columns: { numFlags: true, releaseRound: true },
              },
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
            .from(services)
            .where(isNull(services.deletedAt));

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
