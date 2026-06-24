"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { Badge } from "@phena/ui/components/badge";
import { Button } from "@phena/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@phena/ui/components/tooltip";
import {
  ActivityIcon,
  ArrowUpDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FlagTriangleRightIcon,
  FlagIcon,
  ShieldIcon,
  SwordIcon,
} from "lucide-react";

export interface ChallengePoints {
  challengeId: number;
  challengeName: string;
  attackPoints: number;
  defensePoints: number;
  slaPoints: number;
  totalPoints: number;
  flagsStolen: number;
  flagsDefended: number;
  slaUp: number;
  slaTotal: number;
}

export interface ScoreboardEntry {
  teamId: string;
  teamName: string;
  totalPoints: number;
  attackPoints: number;
  defensePoints: number;
  slaPoints: number;
  flagsStolen: number;
  flagsDefended: number;
  slaUp: number;
  slaTotal: number;
  challenges: ChallengePoints[];
  rank: number;
}

function sortHeader(label: ReactNode) {
  return function SortHeader({
    column,
  }: {
    column: {
      getIsSorted: () => false | "asc" | "desc";
      toggleSorting: (desc?: boolean) => void;
    };
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

export function slaColor(up: number, total: number): string {
  if (total === 0) return "text-muted-foreground";
  const ratio = up / total;
  if (ratio === 1) return "text-emerald-500";
  if (ratio >= 0.8) return "text-amber-500";
  return "text-red-500";
}

function SlaCell({ up, total, points }: { up: number; total: number; points?: number }) {
  if (total === 0) return <span className="text-muted-foreground">0/0</span>;
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className={`font-mono text-sm font-medium ${slaColor(up, total)}`}>
        {up}/{total}
      </span>
      {points !== undefined && <span className="text-muted-foreground text-xs">{points} pts</span>}
    </div>
  );
}

export const leaderboardColumns: ColumnDef<ScoreboardEntry>[] = [
  {
    accessorKey: "rank",
    header: sortHeader("Rank"),
    cell: ({ row }) => {
      const rank = row.original.rank;
      const rankClass =
        rank === 1
          ? "text-yellow-500"
          : rank === 2
            ? "text-gray-400"
            : rank === 3
              ? "text-amber-600"
              : "";
      return <span className={`font-bold ${rankClass}`}>#{rank}</span>;
    },
  },
  {
    accessorKey: "teamName",
    header: sortHeader("Team"),
    cell: ({ row }) => <span className="font-medium">{row.original.teamName}</span>,
  },
  {
    accessorKey: "attackPoints",
    header: sortHeader(
      <span className="inline-flex items-center gap-1">
        <SwordIcon className="size-3" />
        Attack
      </span>,
    ),
  },
  {
    accessorKey: "defensePoints",
    header: sortHeader(
      <span className="inline-flex items-center gap-1">
        <ShieldIcon className="size-3" />
        Defense
      </span>,
    ),
  },
  {
    accessorKey: "flagsStolen",
    header: sortHeader(
      <span className="inline-flex items-center gap-1">
        <FlagTriangleRightIcon className="size-3" />
        Stolen
      </span>,
    ),
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.flagsStolen}</span>,
  },
  {
    accessorKey: "flagsDefended",
    header: sortHeader(
      <span className="inline-flex items-center gap-1">
        <FlagIcon className="size-3" />
        Defended
      </span>,
    ),
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.flagsDefended}</span>,
  },
  {
    accessorKey: "slaUp",
    header: sortHeader(
      <span className="inline-flex items-center gap-1">
        <ActivityIcon className="size-3" />
        SLA
      </span>,
    ),
    cell: ({ row }) => (
      <SlaCell
        up={row.original.slaUp}
        total={row.original.slaTotal}
        points={row.original.slaPoints}
      />
    ),
    sortingFn: (a, b) => {
      const ratioA = a.original.slaTotal === 0 ? 0 : a.original.slaUp / a.original.slaTotal;
      const ratioB = b.original.slaTotal === 0 ? 0 : b.original.slaUp / b.original.slaTotal;
      return ratioA - ratioB;
    },
  },
  {
    accessorKey: "totalPoints",
    header: sortHeader("Total"),
    cell: ({ row }) => <Badge>{row.original.totalPoints} pts</Badge>,
  },
  {
    id: "expand",
    header: "Details",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.challenges?.length ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => row.toggleExpanded()}
              aria-label="Toggle team challenge breakdown"
            >
              {row.getIsExpanded() ? (
                <ChevronUpIcon className="size-4" />
              ) : (
                <ChevronDownIcon className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle team challenge breakdown</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
];
