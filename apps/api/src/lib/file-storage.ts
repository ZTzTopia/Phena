import { Effect } from "effect";
import { ChallengeFileError } from "./errors";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "uploads";
const CHALLENGE_DIR = `${UPLOAD_DIR}/challenges`;

export const getFilePath = (publicId: string, ext: string): string =>
  `${CHALLENGE_DIR}/${publicId}${ext}`;

const hashBuffer = (buffer: ArrayBuffer): string => {
  const hash = new Bun.CryptoHasher("sha256");
  hash.update(buffer);
  return hash.digest("hex");
};

export const saveFile = (
  publicId: string,
  file: File,
): Effect.Effect<{ path: string; hash: string }, ChallengeFileError> =>
  Effect.gen(function* () {
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    const filePath = getFilePath(publicId, ext);

    const buffer = yield* Effect.tryPromise<ArrayBuffer, Error>({
      try: () => file.arrayBuffer(),
      catch: (e) => new Error(String(e)),
    });

    const hash = hashBuffer(buffer);

    const result = yield* Effect.tryPromise<number, Error>({
      try: () => Bun.write(filePath, buffer),
      catch: (e) => new Error(String(e)),
    });

    void result;

    return { path: filePath, hash };
  }).pipe(
    Effect.mapError(
      (e) => new ChallengeFileError({ message: `Failed to save file: ${e.message}` }),
    ),
  );

export const getFile = (
  publicId: string,
  ext: string,
): Effect.Effect<{ buffer: ArrayBuffer; hash: string } | null, never> =>
  Effect.gen(function* () {
    const filePath = getFilePath(publicId, ext);
    const file = Bun.file(filePath);
    const exists = yield* Effect.sync(() => file.exists());
    if (!exists) {
      return null;
    }

    const buffer = yield* Effect.tryPromise<ArrayBuffer, never>({
      try: () => file.arrayBuffer(),
      catch: () => {
        throw new Error("Should never happen");
      },
    });
    const hash = hashBuffer(buffer);

    return { buffer, hash };
  });

export const deleteFile = (publicId: string, ext?: string): Effect.Effect<boolean, never> =>
  Effect.gen(function* () {
    if (ext) {
      const filePath = getFilePath(publicId, ext);
      const file = Bun.file(filePath);
      const exists = yield* Effect.tryPromise<boolean, never>({
        try: () => file.exists(),
        catch: () => {
          throw new Error("Should never happen");
        },
      });

      if (exists) {
        yield* Effect.tryPromise<number, never>({
          try: () => Bun.write(filePath, ""),
          catch: () => {
            throw new Error("Should never happen");
          },
        });
      }

      return true;
    }

    const dir = Bun.file(CHALLENGE_DIR);
    const dirExists = yield* Effect.tryPromise<boolean, never>({
      try: () => dir.exists(),
      catch: () => {
        throw new Error("Should never happen");
      },
    });
    if (!dirExists) {
      return true;
    }

    const glob = new Bun.Glob(`${publicId}.*`);
    const files = [...glob.scanSync({ cwd: CHALLENGE_DIR })];

    for (const name of files) {
      yield* Effect.tryPromise<number, never>({
        try: () => Bun.write(`${CHALLENGE_DIR}/${name}`, ""),
        catch: () => {
          throw new Error("Should never happen");
        },
      });
    }
    return true;
  });

export const fileExists = (publicId: string, ext: string): Effect.Effect<boolean, never> =>
  Effect.gen(function* () {
    const filePath = getFilePath(publicId, ext);
    const file = Bun.file(filePath);
    const exists = yield* Effect.tryPromise<boolean, never>({
      try: () => file.exists(),
      catch: () => {
        throw new Error("Should never happen");
      },
    });
    return exists;
  });
