import { Data } from "effect";

export class TeamNotFoundError extends Data.TaggedError("TeamNotFoundError")<{
  message: string;
}> {
  readonly statusCode = 404;
}
export class TeamNameTakenError extends Data.TaggedError("TeamNameTakenError")<{
  message: string;
}> {
  readonly statusCode = 400;
}
export class TeamCreateError extends Data.TaggedError("TeamCreateError")<{
  message: string;
}> {
  readonly statusCode = 400;
}
export class TeamUpdateError extends Data.TaggedError("TeamUpdateError")<{
  message: string;
}> {
  readonly statusCode = 400;
}

export class SubmissionNotFoundError extends Data.TaggedError("SubmissionNotFoundError")<{
  message: string;
}> {
  readonly statusCode = 404;
}
export class FlagAlreadySubmittedError extends Data.TaggedError("FlagAlreadySubmittedError")<{
  message: string;
}> {
  readonly statusCode = 400;
}
export class FlagSubmitError extends Data.TaggedError("FlagSubmitError")<{
  message: string;
}> {
  readonly statusCode = 400;
}

export class ChallengeNotFoundError extends Data.TaggedError("ChallengeNotFoundError")<{
  message: string;
}> {
  readonly statusCode = 404;
}
export class ChallengeCreateError extends Data.TaggedError("ChallengeCreateError")<{
  message: string;
}> {
  readonly statusCode = 400;
}
export class ChallengeUpdateError extends Data.TaggedError("ChallengeUpdateError")<{
  message: string;
}> {
  readonly statusCode = 400;
}
export class ChallengeFileError extends Data.TaggedError("ChallengeFileError")<{
  message: string;
}> {
  readonly statusCode = 400;
}

export class ServiceNotFoundError extends Data.TaggedError("ServiceNotFoundError")<{
  message: string;
}> {
  readonly statusCode = 404;
}
export class ServiceCreateError extends Data.TaggedError("ServiceCreateError")<{
  message: string;
}> {
  readonly statusCode = 400;
}
export class ServiceUpdateError extends Data.TaggedError("ServiceUpdateError")<{
  message: string;
}> {
  readonly statusCode = 400;
}

export class ConfigValidationError extends Data.TaggedError("ConfigValidationError")<{
  message: string;
}> {
  readonly statusCode = 400;
}

export const domainErrors = [
  TeamNotFoundError,
  TeamNameTakenError,
  TeamCreateError,
  TeamUpdateError,
  SubmissionNotFoundError,
  FlagAlreadySubmittedError,
  FlagSubmitError,
  ChallengeNotFoundError,
  ChallengeCreateError,
  ChallengeUpdateError,
  ChallengeFileError,
  ServiceNotFoundError,
  ServiceCreateError,
  ServiceUpdateError,
  ConfigValidationError,
] as const;

export type DomainError = InstanceType<(typeof domainErrors)[number]>;
