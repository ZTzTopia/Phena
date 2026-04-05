import { Effect } from "effect";
import { logger } from "hono/logger";
import { stripVTControlCharacters } from "node:util";

type PrintFunc = (str: string, ...rest: string[]) => void;

const isIncoming = (str: string) => str.startsWith("<--");
const isOutgoing = (str: string) => str.startsWith("-->");

const effectPrintFunc: PrintFunc = (message: string, ...rest: string[]) => {
  if (isIncoming(message)) {
    const parts = message.replace(/<--\s*/, "").split(" ");
    const method = parts[0];
    const path = parts[1];
    Effect.runSync(
      Effect.gen(function* () {
        yield* Effect.log(message, ...rest);
      }).pipe(
        Effect.annotateLogs({
          type: "incoming",
          method,
          path,
        }),
      ),
    );
  } else if (isOutgoing(message)) {
    const parts = message.replace(/-->\s*/, "").split(" ");
    const method = parts[0];
    const path = parts[1];
    const status = stripVTControlCharacters(parts[2]!);
    const elapsed = parts[3];
    Effect.runSync(
      Effect.gen(function* () {
        yield* Effect.log(message, ...rest);
      }).pipe(
        Effect.annotateLogs({
          type: "outgoing",
          method,
          status,
          path,
          elapsed,
        }),
      ),
    );
  } else {
    Effect.runSync(
      Effect.gen(function* () {
        yield* Effect.log(message, ...rest);
      }),
    );
  }
};

export const effectLogger = () => logger(effectPrintFunc);
