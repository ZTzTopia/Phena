import z from "zod/v4";

export const TeamSchema = z.object({
  id: z.string(),
  internalId: z.number().optional(),
  name: z.string(),
  role: z.enum(["team", "admin"]).optional(),
  createdAt: z
    .string()
    .or(z.date())
    .transform((d) => (d instanceof Date ? d.toISOString() : d)),
  updatedAt: z
    .string()
    .or(z.date())
    .transform((d) => (d instanceof Date ? d.toISOString() : d)),
});

export const TeamModel = {
  createTeam: z.object({
    name: z.string().min(1),
    password: z.string().min(6),
  }),
  updateTeam: z.object({
    name: z.string().min(1).optional(),
    password: z.string().min(6).optional(),
  }),
  getTeamParams: z.object({
    publicId: z.string(),
  }),
  updateTeamQuery: z.object({
    publicId: z.string(),
  }),
  deleteTeamQuery: z.object({
    publicId: z.string(),
  }),
  teamResponse: z.object({
    team: TeamSchema,
  }),
  teamsListResponse: z.object({
    teams: z.array(TeamSchema),
  }),
} as const;

export type TeamModel = {
  [k in keyof typeof TeamModel]: z.infer<(typeof TeamModel)[k]>;
};
