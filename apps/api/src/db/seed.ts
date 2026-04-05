import { reset, seed } from "drizzle-seed";
import { Effect } from "effect";
import { hashPassword } from "../lib/password";
import { db } from "./index";
import { challenges } from "./schema/challenges";
import { flags } from "./schema/flags";
import { scoresPerTick } from "./schema/scores";
import { serviceScoresPerTick } from "./schema/service-scores";
import { services } from "./schema/services";
import { submissions } from "./schema/submissions";
import { teams } from "./schema/teams";

const SEED_VALUE = 1337;
const SEED_VERSION = "4" as const;

const resetDb = Effect.tryPromise({
  try: () =>
    reset(db, {
      services,
      challenges,
      teams,
      scoresPerTick,
      serviceScoresPerTick,
      flags,
      submissions,
    }),
  catch: (e) => new Error(`Reset failed: ${e}`),
});

const seedTeamsChallenges = (passwordHash: string) =>
  Effect.tryPromise({
    try: () =>
      seed(db, { teams, challenges }, { seed: SEED_VALUE, version: SEED_VERSION }).refine((f) => ({
        teams: {
          count: 5,
          columns: {
            publicId: false,
            name: f.string({ isUnique: true }),
            password: f.default({ defaultValue: passwordHash }),
            role: f.default({ defaultValue: "team" }),
          },
        },
        challenges: {
          count: 4,
          columns: {
            publicId: false,
            slug: f.string({ isUnique: true }),
            title: f.string({ isUnique: true }),
            numFlags: f.default({ defaultValue: 1 }),
            releaseRound: f.valuesFromArray({ values: [1, 2] }),
          },
        },
      })),
    catch: (e) => new Error(`Seed teams/challenges failed: ${e}`),
  });

const selectTeams = Effect.tryPromise({
  try: () => db.select({ id: teams.id }).from(teams),
  catch: (e) => new Error(`Select teams failed: ${e}`),
});

const selectChallenges = Effect.tryPromise({
  try: () => db.select({ id: challenges.id }).from(challenges),
  catch: (e) => new Error(`Select challenges failed: ${e}`),
});

const insertServices = (serviceData: (typeof services.$inferInsert)[]) =>
  Effect.tryPromise({
    try: () => db.insert(services).values(serviceData),
    catch: (e) => new Error(`Insert services failed: ${e}`),
  });

const selectServices = Effect.tryPromise({
  try: () => db.select({ id: services.id, teamId: services.teamId }).from(services),
  catch: (e) => new Error(`Select services failed: ${e}`),
});

const insertFlags = (flagData: (typeof flags.$inferInsert)[]) =>
  Effect.tryPromise({
    try: () => db.insert(flags).values(flagData),
    catch: (e) => new Error(`Insert flags failed: ${e}`),
  });

const selectFlags = Effect.tryPromise({
  try: () =>
    db.select({ id: flags.id, serviceId: flags.serviceId, value: flags.value }).from(flags),
  catch: (e) => new Error(`Select flags failed: ${e}`),
});

const insertScores = (scoreData: (typeof scoresPerTick.$inferInsert)[]) =>
  Effect.tryPromise({
    try: () => db.insert(scoresPerTick).values(scoreData),
    catch: (e) => new Error(`Insert scores failed: ${e}`),
  });

const insertServiceScores = (serviceScoreData: (typeof serviceScoresPerTick.$inferInsert)[]) =>
  Effect.tryPromise({
    try: () => db.insert(serviceScoresPerTick).values(serviceScoreData),
    catch: (e) => new Error(`Insert service scores failed: ${e}`),
  });

const insertSubmissions = (submissionData: (typeof submissions.$inferInsert)[]) =>
  Effect.tryPromise({
    try: () => db.insert(submissions).values(submissionData),
    catch: (e) => new Error(`Insert submissions failed: ${e}`),
  });

const seedAdminTeam = (adminPasswordHash: string) =>
  Effect.tryPromise({
    try: () =>
      seed(db, { teams }, { seed: SEED_VALUE, version: SEED_VERSION }).refine((f) => ({
        teams: {
          count: 1,
          columns: {
            id: f.default({ defaultValue: 1337 }),
            publicId: false,
            name: f.default({ defaultValue: "Admin Team" }),
            email: f.default({ defaultValue: "admin@phena.local" }),
            password: f.default({ defaultValue: adminPasswordHash }),
            role: f.default({ defaultValue: "admin" }),
          },
        },
      })),
    catch: (e) => new Error(`Seed admin team failed: ${e}`),
  });

const seedDb = Effect.gen(function* () {
  yield* Effect.logInfo("Starting database seeding...");
  yield* Effect.logInfo("Resetting database...");
  yield* resetDb;

  const passwordHash = yield* hashPassword("123");
  yield* seedTeamsChallenges(passwordHash);

  const seededTeams = yield* selectTeams;
  const seededChallenges = yield* selectChallenges;

  if (seededTeams.length === 0 || seededChallenges.length === 0) {
    yield* Effect.fail(new Error("Expected at least one seeded team and challenge"));
  }

  const serviceData: (typeof services.$inferInsert)[] = [];
  for (const team of seededTeams) {
    for (const challenge of seededChallenges) {
      serviceData.push({
        teamId: team.id,
        challengeId: challenge.id,
        status: "pending" as const,
      });
    }
  }

  if (serviceData.length > 0) {
    yield* insertServices(serviceData);
    yield* Effect.logInfo(
      `Created ${serviceData.length} services (${seededTeams.length} teams x ${seededChallenges.length} challenges)`,
    );
  }

  const seededServices = yield* selectServices;

  const flagData: (typeof flags.$inferInsert)[] = [];
  for (const service of seededServices) {
    for (let round = 1; round <= 3; round++) {
      for (let tick = 1; tick <= 10; tick++) {
        flagData.push({
          serviceId: service.id,
          round,
          tick,
          index: 0,
          value: `PHENA{${Bun.randomUUIDv7()}}`,
        });
      }
    }
  }

  if (flagData.length > 0) {
    yield* insertFlags(flagData);
    yield* Effect.logInfo(`Created ${flagData.length} flags`);
  }

  const seededFlags = yield* selectFlags;

  const scoreData: (typeof scoresPerTick.$inferInsert)[] = [];
  for (const team of seededTeams) {
    for (let round = 1; round <= 3; round++) {
      for (let tick = 1; tick <= 10; tick++) {
        const attackPoints = Math.floor(Math.random() * 100);
        const defensePoints = Math.floor(Math.random() * 50);
        const slaPoints = Math.floor(Math.random() * 100);
        scoreData.push({
          teamId: team.id,
          round,
          tick,
          attackPoints,
          defensePoints,
          slaPoints,
          totalPoints: attackPoints + defensePoints + slaPoints,
        });
      }
    }
  }

  if (scoreData.length > 0) {
    yield* insertScores(scoreData);
    yield* Effect.logInfo(`Created ${scoreData.length} score entries`);
  }

  const serviceScoreData: (typeof serviceScoresPerTick.$inferInsert)[] = [];
  for (const service of seededServices) {
    for (let round = 1; round <= 3; round++) {
      for (let tick = 1; tick <= 10; tick++) {
        const attackPoints = Math.floor(Math.random() * 100);
        const defensePoints = Math.floor(Math.random() * 50);
        const slaPoints = Math.floor(Math.random() * 100);
        serviceScoreData.push({
          teamId: service.teamId,
          serviceId: service.id,
          round,
          tick,
          attackPoints,
          defensePoints,
          slaPoints,
          totalPoints: attackPoints + defensePoints + slaPoints,
        });
      }
    }
  }

  if (serviceScoreData.length > 0) {
    yield* insertServiceScores(serviceScoreData);
    yield* Effect.logInfo(`Created ${serviceScoreData.length} service score entries`);
  }

  const submissionData: (typeof submissions.$inferInsert)[] = [];
  for (const team of seededTeams) {
    for (let round = 1; round <= 3; round++) {
      for (let tick = 1; tick <= 10; tick++) {
        const numSubmissions = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < numSubmissions; i++) {
          const teamFlags = seededFlags.filter((f) => {
            const service = seededServices.find((s) => s.id === f.serviceId);
            return service && service.teamId !== team.id;
          });
          if (teamFlags.length === 0) continue;

          const flag = teamFlags[Math.floor(Math.random() * teamFlags.length)];
          if (!flag) continue;

          const isCorrect = Math.random() > 0.5;
          submissionData.push({
            teamId: team.id,
            flagId: flag.id,
            round,
            tick,
            value: flag.value,
            status: (isCorrect ? "correct" : "incorrect") as "correct" | "incorrect",
          });
        }
      }
    }
  }

  if (submissionData.length > 0) {
    yield* insertSubmissions(submissionData);
    yield* Effect.logInfo(`Created ${submissionData.length} submissions`);
  }

  const adminPasswordHash = yield* hashPassword("admin");
  yield* seedAdminTeam(adminPasswordHash);

  yield* Effect.logInfo("Database seeded successfully!");
});

Effect.runPromise(seedDb)
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(`Seeding failed: ${error}`);
    process.exit(1);
  });
