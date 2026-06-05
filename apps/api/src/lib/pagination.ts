import type { PaginationMeta } from "@phena/schema";

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function getPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
