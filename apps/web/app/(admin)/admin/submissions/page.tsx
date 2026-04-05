"use client";

import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { useCallback, useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { client } from "@/lib/api-client";
import { submissionsColumns } from "./columns";

export default function SubmissionsPage() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPageIndex(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "admin",
      "submissions",
      { page: pageIndex + 1, limit: pageSize, search: debouncedSearch },
    ],
    queryFn: async () => {
      const res = await parseResponse(
        client.api.submissions.$get({
          query: { page: String(pageIndex + 1), limit: String(pageSize), search: debouncedSearch },
        }),
      );
      return res;
    },
    placeholderData: (previousData) => previousData,
  });

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearchInput(newSearch);
  }, []);

  const handlePageChange = useCallback((newPageIndex: number) => {
    setPageIndex(newPageIndex);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground">View all flag submission attempts</p>
      </div>

      <div className="px-4 lg:px-6">
        <DataTable
          columns={submissionsColumns}
          data={data?.submissions ?? []}
          filterPlaceholder="Search submissions..."
          noResultsText="No submissions found"
          initialPageSize={pageSize}
          pageCount={data?.pagination.totalPages}
          totalRows={data?.pagination.total}
          pageIndex={pageIndex}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          isLoading={isFetching}
        />
      </div>
    </div>
  );
}
