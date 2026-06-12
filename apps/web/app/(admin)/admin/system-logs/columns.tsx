"use client";

import type { SystemLog } from "@phena/schema";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@phena/ui/components/badge";
import { Button } from "@phena/ui/components/button";
import { ArrowUpDownIcon } from "lucide-react";

const typeVariant: Record<string, "default" | "secondary" | "destructive"> = {
  success: "default",
  info: "secondary",
  error: "destructive",
};

function sortableHeader(label: string) {
  return function SortableHeader({
    column,
  }: {
    column: { getIsSorted: () => false | "asc" | "desc"; toggleSorting: (desc?: boolean) => void };
  }) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label}
        <ArrowUpDownIcon className="ml-1 size-3" />
      </Button>
    );
  };
}

export const systemLogColumns: ColumnDef<SystemLog>[] = [
  {
    accessorKey: "createdAt",
    header: sortableHeader("Timestamp"),
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.createdAt}</span>,
  },
  {
    accessorKey: "type",
    header: sortableHeader("Type"),
    cell: ({ row }) => (
      <Badge variant={typeVariant[row.original.type] ?? "secondary"}>{row.original.type}</Badge>
    ),
  },
  {
    accessorKey: "message",
    header: sortableHeader("Message"),
    cell: ({ row }) => <span className="max-w-md truncate text-sm">{row.original.message}</span>,
  },
  {
    accessorKey: "teamName",
    header: sortableHeader("Team"),
    cell: ({ row }) => <span className="text-sm">{row.original.team?.name ?? "—"}</span>,
  },
  {
    id: "roundTick",
    header: sortableHeader("Round/Tick"),
    cell: ({ row }) => {
      const round = row.original.round;
      const tick = row.original.tick;
      if (round === null && tick === null) {
        return <span className="font-mono text-xs">—</span>;
      }
      return (
        <span className="font-mono text-xs">
          {round != null ? `R${round}` : "R—"}/{tick != null ? `T${tick}` : "T—"}
        </span>
      );
    },
  },
];
