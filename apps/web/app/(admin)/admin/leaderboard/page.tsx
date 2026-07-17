"use client";

import { QueryError } from "@/app/(admin)/_components/query-error";
import Loading from "@/app/(admin)/loading";
import { DataTable } from "@/components/data-table";
import { LeaderboardBreakdown } from "./_components/leaderboard-breakdown";
import { useLeaderboard } from "./_hooks/use-leaderboard";
import { leaderboardColumns } from "./columns";

export default function AdminLeaderboardPage() {
  const { scoreboard: rows, isLoading, isError, refetch } = useLeaderboard();

  if (isLoading) {
    return <Loading />;
  }

  if (isError && rows.length === 0) {
    return <QueryError onRetry={() => refetch()} message="Failed to load leaderboard" />;
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">Detailed team rankings with point breakdowns</p>
      </div>

      <div className="px-4 lg:px-6">
        <DataTable
          columns={leaderboardColumns}
          data={rows}
          filterPlaceholder="Search teams..."
          noResultsText="No scores yet"
          initialPageSize={20}
          getRowCanExpand={(row) => row.original.challenges?.length > 0}
          renderSubComponent={({ row }) => (
            <LeaderboardBreakdown challenges={row.original.challenges} />
          )}
        />
      </div>
    </div>
  );
}
