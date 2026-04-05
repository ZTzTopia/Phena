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
}

export interface ScoreboardEntry {
  teamId: number;
  teamName: string;
  totalScore: number;
  attackPoints: number;
  defensePoints: number;
  slaPoints: number;
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
    accessorKey: "slaPoints",
    header: sortHeader(
      <span className="inline-flex items-center gap-1">
        <ActivityIcon className="size-3" />
        SLA
      </span>,
    ),
  },
  {
    accessorKey: "totalScore",
    header: sortHeader("Total"),
    cell: ({ row }) => <Badge>{row.original.totalScore} pts</Badge>,
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
