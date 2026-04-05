import type { TeamModel } from "@phena/schema";
import type { InferResponseType } from "hono/client";
import type { client } from "@/lib/api-client";

export type TeamForm = TeamModel["createTeam"];
export type TeamResponse = InferResponseType<typeof client.api.teams.$get, 200>["teams"][number];
