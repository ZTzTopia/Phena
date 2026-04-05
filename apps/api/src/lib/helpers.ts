import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import z from "zod/v4";

export const sJson = <T extends z.ZodSchema<unknown>>(
  c: Context,
  schema: T,
  data: z.input<T>,
  status: ContentfulStatusCode = 200,
) => {
  return c.json(schema.parse(data), status);
};
