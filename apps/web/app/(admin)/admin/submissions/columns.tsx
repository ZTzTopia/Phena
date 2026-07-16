"use client";

import type { Submission } from "@phena/schema";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@phena/ui/components/badge";
import { Button } from "@phena/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@phena/ui/components/dialog";
import { ArrowUpDownIcon, EyeIcon } from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  correct: "default",
  incorrect: "destructive",
  already_captured: "secondary",
  expired: "outline",
  self_submission: "outline",
  invalid_format: "destructive",
};

function maskFlag(flag: string) {
  if (flag.length <= 8) return flag;
  return `${flag.slice(0, 4)}...${flag.slice(-4)}`;
}

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

export const submissionsColumns: ColumnDef<Submission>[] = [
  {
    accessorKey: "createdAt",
    header: sortableHeader("Timestamp"),
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.createdAt}</span>,
  },
  {
    accessorKey: "teamName",
    header: sortableHeader("Team"),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.team?.name ?? "Unknown"}</span>
        <span className="text-muted-foreground text-xs">
          ID: {row.original.team?.publicId ?? "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "flagValue",
    header: sortableHeader("Flag"),
    cell: ({ row }) => {
      const flag = row.original.flag?.value ?? row.original.value;
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className="font-mono text-xs">{maskFlag(flag)}</span>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="size-6">
                <EyeIcon className="size-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Flag</DialogTitle>
              </DialogHeader>
              <code className="block break-all bg-muted p-3 text-xs font-mono">
                {flag}
              </code>
            </DialogContent>
          </Dialog>
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: sortableHeader("Status"),
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status] ?? "outline"}>{row.original.status}</Badge>
    ),
  },
  {
    id: "roundTick",
    header: sortableHeader("Round/Tick"),
    sortingFn: (a, b) => {
      const aValue = a.original.round * 100000 + a.original.tick;
      const bValue = b.original.round * 100000 + b.original.tick;
      return aValue - bValue;
    },
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        R{row.original.round}/T{row.original.tick}
      </span>
    ),
  },
];
