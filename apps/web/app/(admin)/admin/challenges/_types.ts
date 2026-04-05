import type { ChallengeModel } from "@phena/schema";

export type ChallengeResponse = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  numFlags: number;
  releaseRound: number;
  filePath: string | null;
  fileHash: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChallengeFormInput = ChallengeModel["createChallenge"] & {
  file: File | null;
};
