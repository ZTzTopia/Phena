"use client";

import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { ServerDataTable } from "@/components/data-table";
import { client } from "@/lib/api-client";
import { submissionsColumns } from "./columns";
import { usePaginatedSearchState } from "@/hooks/use-paginated-search-state";

export default function SubmissionsPage() {
  const {
    pageIndex,
    pageSize,
    searchInput,
    debouncedSearch,
    setPageIndex,
    setPageSize,
    setSearchInput,
  } = usePaginatedSearchState({ initialPageSize: 20 });

  const { data, isFetching } = useQuery({
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

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground">View all flag submission attempts</p>
      </div>

      <div className="px-4 lg:px-6">
        <ServerDataTable
          columns={submissionsColumns}
          data={data?.submissions ?? []}
          filterPlaceholder="Search submissions..."
          noResultsText="No submissions found"
          pageCount={data?.pagination.totalPages ?? 1}
          totalRows={data?.pagination.total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={(size: number) => {
            setPageSize(size);
            setPageIndex(0);
          }}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          isLoading={isFetching}
        />
      </div>
    </div>
  );
}
