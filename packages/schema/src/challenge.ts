import z from "zod/v4";
import { PaginationMetaSchema } from "./common";

const ALLOWED_EXTENSIONS = [".zip", ".tar", ".tar.gz", ".tgz", ".7z"] as const;
const MAX_UPLOAD_SIZE = 100 * 1024 * 1024;

export const ChallengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string().nullable(),
  numFlags: z.number(),
  releaseRound: z.number(),
  filePath: z.string().nullable(),
  fileHash: z.string().nullable(),
  createdAt: z
    .string()
    .or(z.date())
    .transform((d) => (d instanceof Date ? d.toISOString() : d)),
  updatedAt: z
    .string()
    .or(z.date())
    .transform((d) => (d instanceof Date ? d.toISOString() : d)),
});

export const ChallengeModel = {
  createChallenge: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.string().optional(),
    numFlags: z.number().int().positive().default(1),
    releaseRound: z.number().int().positive().default(1),
  }),
  updateChallenge: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    category: z.string().nullable().optional(),
    numFlags: z.number().int().positive().optional(),
    releaseRound: z.number().int().positive().optional(),
  }),
  getChallengeParams: z.object({
    publicId: z.string(),
  }),
  updateChallengeQuery: z.object({
    publicId: z.string(),
  }),
  deleteChallengeQuery: z.object({
    publicId: z.string(),
  }),
  challengeResponse: z.object({
    challenge: ChallengeSchema,
  }),
  challengesListResponse: z.object({
    challenges: z.array(ChallengeSchema),
    pagination: PaginationMetaSchema,
  }),
  uploadFile: z.object({
    file: z
      .instanceof(File)
      .refine(
        (file) => {
          const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
          return ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number]);
        },
        { message: `File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
      )
      .refine((file) => file.size <= MAX_UPLOAD_SIZE, {
        message: `File too large. Max size: ${MAX_UPLOAD_SIZE / 1024 / 1024}MB`,
      }),
  }),
  downloadQuery: z.object({
    token: z.string().optional(),
  }),
} as const;

export type ChallengeModel = {
  [k in keyof typeof ChallengeModel]: z.infer<(typeof ChallengeModel)[k]>;
};
