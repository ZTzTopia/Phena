import { Effect } from "effect";

export const hashPassword = (password: string) =>
  Effect.tryPromise({
    try: () =>
      Bun.password.hash(password, {
        algorithm: "argon2id",
        memoryCost: 1024,
        timeCost: 4,
      }),
    catch: (e) => new Error(`Hash failed: ${e}`),
  });

export const verifyPassword = (password: string, hash: string) =>
  Effect.tryPromise({
    try: () => Bun.password.verify(password, hash, "argon2id"),
    catch: (e) => new Error(`Verify failed: ${e}`),
  });
