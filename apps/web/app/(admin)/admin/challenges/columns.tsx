"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@phena/ui/components/badge";
import { Button } from "@phena/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@phena/ui/components/tooltip";
import { ArrowUpDownIcon, DownloadIcon, PaperclipIcon, PencilIcon, TrashIcon } from "lucide-react";
import type { ChallengeResponse } from "./_types";

type ChallengeColumnsOptions = {
  onEdit: (challenge: ChallengeResponse) => void;
  onDelete: (id: string) => void;
  onDownload: (challenge: ChallengeResponse) => void;
  isDeleting: boolean;
};

const sortableHeader = (label: string) => {
  return ({
    column,
  }: {
    column: {
      getIsSorted: () => false | "asc" | "desc";
      toggleSorting: (desc?: boolean) => void;
    };
  }) => (
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

export function getChallengeColumns({
  onEdit,
  onDelete,
  onDownload,
  isDeleting,
}: ChallengeColumnsOptions): ColumnDef<ChallengeResponse>[] {
  return [
    {
      accessorKey: "title",
      header: sortableHeader("Title"),
    },
    {
      accessorKey: "numFlags",
      header: sortableHeader("Flags"),
      cell: ({ row }) => <Badge variant="outline">{row.original.numFlags}</Badge>,
    },
    {
      accessorKey: "releaseRound",
      header: sortableHeader("Round"),
      cell: ({ row }) => <Badge variant="secondary">{row.original.releaseRound}</Badge>,
    },
    {
      accessorKey: "filePath",
      header: sortableHeader("File"),
      cell: ({ row }) =>
        row.original.filePath ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex cursor-default items-center gap-1">
                <PaperclipIcon className="size-3" />
                <span className="max-w-[100px] truncate text-sm">
                  {row.original.filePath.split("/").pop()}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hash: {row.original.fileHash}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {row.original.filePath && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onDownload(row.original)}>
                  <DownloadIcon className="size-4" />
                  <span className="sr-only">Download challenge file</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download file</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
                <PencilIcon className="size-4" />
                <span className="sr-only">Edit challenge</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit challenge</p>
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
                <span className="sr-only">Delete challenge</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete challenge</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];
}
