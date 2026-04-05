import z from "zod/v4";
import { PaginationMetaSchema } from "./common";

export const SubmissionSchema = z.object({
  id: z.number().int(),
  round: z.number().int(),
  tick: z.number().int(),
  value: z.string(),
  status: z.string(),
  createdAt: z
    .string()
    .or(z.date())
    .transform((d) => (d instanceof Date ? d.toISOString() : d)),
  team: z
    .object({
      publicId: z.string(),
      name: z.string(),
    })
    .nullable(),
  flag: z
    .object({
      value: z.string(),
    })
    .nullable(),
});

export type Submission = z.infer<typeof SubmissionSchema>;

export const SubmissionsModel = {
  submissionBody: z.object({
    flags: z.union([z.string().min(1), z.array(z.string().min(1))]),
  }),
  submissionResponse: z.object({
    results: z.array(
      z.object({
        value: z.string(),
        status: z.string(),
      }),
    ),
  }),
  submissionsHistoryResponse: z.object({
    submissions: z.array(SubmissionSchema),
    pagination: PaginationMetaSchema,
  }),
} as const;

export type SubmissionsModel = {
  [k in keyof typeof SubmissionsModel]: z.infer<(typeof SubmissionsModel)[k]>;
};
