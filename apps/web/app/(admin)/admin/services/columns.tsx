"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@phena/ui/components/badge";
import { Button } from "@phena/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@phena/ui/components/tooltip";
import { ArrowUpDownIcon, PlayIcon, RefreshCwIcon, RotateCcwIcon } from "lucide-react";
import type { ServiceResponse } from "./_types";

type ServiceColumnsOptions = {
  onProvision: (id: number) => void;
  onReset: (service: ServiceResponse) => void;
  onRestart: (id: number) => void;
  isProvisioning: boolean;
  isResetting: boolean;
  isRestarting: boolean;
};

const statusColors: Record<ServiceResponse["status"], "default" | "secondary" | "destructive"> = {
  up: "default",
  down: "destructive",
  pending: "secondary",
};

function sortableHeader(label: string) {
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

export function getServicesColumns({
  onProvision,
  onReset,
  onRestart,
  isProvisioning,
  isResetting,
  isRestarting,
}: ServiceColumnsOptions): ColumnDef<ServiceResponse>[] {
  return [
    {
      id: "team",
      accessorFn: (row) => row.team?.name,
      header: sortableHeader("Team"),
      cell: ({ row }) => row.original.team?.name || "-",
    },
    {
      id: "challenge",
      accessorFn: (row) => row.challenge?.title,
      header: sortableHeader("Challenge"),
      cell: ({ row }) => row.original.challenge?.title || "-",
    },
    {
      accessorKey: "status",
      header: sortableHeader("Status"),
      cell: ({ row }) => (
        <Badge variant={statusColors[row.original.status]}>{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: "host",
      header: "Host",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.host || "-"}</span>,
    },
    {
      accessorKey: "port",
      header: sortableHeader("Port"),
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.port ?? "-"}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Provision"
                onClick={() => onProvision(row.original.id)}
                disabled={isProvisioning}
              >
                <PlayIcon className="size-4" />
                <span className="sr-only">Provision service</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Provision service</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Reset"
                onClick={() => onReset(row.original)}
                disabled={isResetting}
              >
                <RotateCcwIcon className="size-4" />
                <span className="sr-only">Reset service</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset service</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Restart"
                onClick={() => onRestart(row.original.id)}
                disabled={isRestarting}
              >
                <RefreshCwIcon className="size-4" />
                <span className="sr-only">Restart service</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Restart service</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];
}
