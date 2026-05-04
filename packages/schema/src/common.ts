import z from "zod/v4";

export const UuidSchema = z.uuid();
export type Uuid = z.infer<typeof UuidSchema>;

export const NanoIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{16,32}$/);
export type NanoId = z.infer<typeof NanoIdSchema>;

export const TimestampSchema = z.coerce.date();
export type Timestamp = z.infer<typeof TimestampSchema>;

export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export const CommonModel = {
  paginationQuery: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
  }),
  publicIdParam: z.object({
    publicId: z.string(),
  }),
  successResponse: z.object({
    message: z.string().optional(),
  }),
  errorResponse: z.object({
    error: z.string().optional(),
  }),
  multiErrorResponse: z.object({
    errors: z.array(z.string()),
  }),
} as const;

export type CommonModel = {
  [k in keyof typeof CommonModel]: z.infer<(typeof CommonModel)[k]>;
};
