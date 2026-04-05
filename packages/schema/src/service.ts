import z from "zod/v4";

export const ServiceStatusEnum = z.enum(["up", "down", "pending"]);
export type ServiceStatus = z.infer<typeof ServiceStatusEnum>;

export const ServiceSchema = z.object({
  id: z.number(),
  status: ServiceStatusEnum,
  host: z.string().nullable(),
  port: z.number().int().nullable(),
  createdAt: z
    .string()
    .or(z.date())
    .transform((d) => (d instanceof Date ? d.toISOString() : d)),
  updatedAt: z
    .string()
    .or(z.date())
    .transform((d) => (d instanceof Date ? d.toISOString() : d)),
  team: z
    .object({
      publicId: z.string(),
      name: z.string(),
    })
    .nullable(),
  challenge: z
    .object({
      publicId: z.string(),
      title: z.string(),
    })
    .nullable(),
});

export const ServiceOperationTypeEnum = z.enum(["provision", "reset", "restart"]);
export type ServiceOperationType = z.infer<typeof ServiceOperationTypeEnum>;

export const ServiceOperationStatusEnum = z.enum(["pending", "success", "failed"]);
export type ServiceOperationStatus = z.infer<typeof ServiceOperationStatusEnum>;

export const ServiceOperationSchema = z.object({
  id: z.number(),
  serviceId: z.number(),
  adminId: z.number(),
  type: ServiceOperationTypeEnum,
  status: ServiceOperationStatusEnum,
  resultMessage: z.string().nullable(),
  createdAt: z
    .string()
    .or(z.date())
    .transform((d) => (d instanceof Date ? d.toISOString() : d)),
});

export const CheckerResultStatusEnum = z.enum(["up", "down", "error"]);
export type CheckerResultStatus = z.infer<typeof CheckerResultStatusEnum>;

export const CheckerResultSchema = z.object({
  id: z.number(),
  serviceId: z.number(),
  round: z.number().int(),
  tick: z.number().int(),
  status: CheckerResultStatusEnum,
  message: z.string().nullable(),
  latency: z.number().nullable(),
  createdAt: z
    .string()
    .or(z.date())
    .transform((d) => (d instanceof Date ? d.toISOString() : d)),
});

export const ServiceModel = {
  createService: z.object({
    teamId: z.number().int().positive(),
    challengeId: z.number().int().positive(),
  }),
  updateService: z.object({
    status: ServiceStatusEnum.optional(),
    host: z.string().optional(),
    port: z.number().int().positive().optional(),
  }),
  serviceParams: z.object({
    id: z.coerce.number().int().positive(),
  }),
  serviceResponse: z.object({
    service: ServiceSchema,
  }),
  servicesListResponse: z.object({
    services: z.array(ServiceSchema),
  }),
  serviceDetailResponse: z.object({
    service: ServiceSchema,
  }),
  createServiceOperation: z.object({
    type: ServiceOperationTypeEnum,
  }),
  serviceOperationResponse: z.object({
    operation: ServiceOperationSchema,
  }),
  checkerResult: z.object({
    service_id: z.number().int().positive(),
    team_id: z.number().int().positive(),
    challenge_id: z.number().int().positive(),
    tick: z.number().int(),
    round: z.number().int(),
    status: CheckerResultStatusEnum,
    message: z.string().optional(),
    checked_at: z.string().or(z.date()),
  }),
  checkerResultResponse: z.object({
    result: CheckerResultSchema,
  }),
} as const;

export type ServiceModel = {
  [k in keyof typeof ServiceModel]: z.infer<(typeof ServiceModel)[k]>;
};
