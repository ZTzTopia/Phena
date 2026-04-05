"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@phena/ui/components/badge";
import { Button } from "@phena/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@phena/ui/components/tooltip";
import { ArrowUpDownIcon, PencilIcon, TrashIcon } from "lucide-react";
import type { TeamResponse } from "./_types";

type TeamColumnsOptions = {
  onEdit: (team: TeamResponse) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

function sortableHeader(label: string) {
  return function SortHeader({
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

export function getTeamColumns({
  onEdit,
  onDelete,
  isDeleting,
}: TeamColumnsOptions): ColumnDef<TeamResponse>[] {
  return [
    {
      accessorKey: "id",
      header: sortableHeader("Team ID"),
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.id}</span>,
    },
    {
      accessorKey: "name",
      header: sortableHeader("Team"),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "role",
      header: sortableHeader("Role"),
      cell: ({ row }) => <Badge variant="outline">{row.original.role}</Badge>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
                <PencilIcon className="size-4" />
                <span className="sr-only">Edit team</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit team</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(row.original.id)}
                disabled={isDeleting}
              >
                <TrashIcon className="text-destructive size-4" />
                <span className="sr-only">Delete team</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete team</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];
}
