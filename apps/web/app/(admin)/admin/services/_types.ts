import type { ServiceModel } from "@phena/schema";
import type { InferResponseType } from "hono/client";
import type { client } from "@/lib/api-client";

export type ServiceForm = ServiceModel["createService"];
export type ServiceResponse = InferResponseType<
  typeof client.api.services.$get,
  200
>["services"][number];
