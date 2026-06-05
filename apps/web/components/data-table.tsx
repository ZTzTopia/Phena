"use client";

import { Button } from "@phena/ui/components/button";
import { Input } from "@phena/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@phena/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@phena/ui/components/table";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
  type PaginationState,
  type Row,
  type Table as TableType,
} from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import * as React from "react";

type DataTableBaseProps<TData, TValue = unknown> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterPlaceholder?: string;
  noResultsText?: string;
  pageSizeOptions?: number[];
  getRowCanExpand?: (row: Row<TData>) => boolean;
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode;
};

type DataTableProps<TData, TValue = unknown> = DataTableBaseProps<TData, TValue> & {
  initialPageSize?: number;
};

type ServerDataTableProps<TData, TValue = unknown> = DataTableBaseProps<TData, TValue> & {
  pageCount: number;
  totalRows?: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  searchValue?: string;
  onSearchChange?: (search: string) => void;
  isLoading?: boolean;
};

function DataTablePagination<TData>({ table }: { table: TableType<TData> }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Rows per page</span>
        <Select
          value={String(table.getState().pagination.pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger size="sm" className="w-20">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50, 100].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-muted-foreground text-xs">
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
        </div>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeftIcon className="size-4" />
          <span className="sr-only">Go to first page</span>
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeftIcon className="size-4" />
          <span className="sr-only">Go to previous page</span>
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRightIcon className="size-4" />
          <span className="sr-only">Go to next page</span>
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRightIcon className="size-4" />
          <span className="sr-only">Go to last page</span>
        </Button>
      </div>
    </div>
  );
}

function DataTableBody<TData, TValue = unknown>({
  table,
  columns,
  isLoading,
  noResultsText,
  renderSubComponent,
}: {
  table: TableType<TData>;
  columns: ColumnDef<TData, TValue>[];
  isLoading?: boolean;
  noResultsText: string;
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode;
}) {
  return (
    <TableBody>
      {isLoading ? (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            <div className="text-muted-foreground flex items-center justify-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Loading...
            </div>
          </TableCell>
        </TableRow>
      ) : table.getRowModel().rows.length ? (
        table.getRowModel().rows.map((row) => (
          <React.Fragment key={row.id}>
            <TableRow>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
            {row.getIsExpanded() && renderSubComponent ? (
              <TableRow>
                <TableCell colSpan={row.getVisibleCells().length} className="bg-muted/20">
                  {renderSubComponent({ row })}
                </TableCell>
              </TableRow>
            ) : null}
          </React.Fragment>
        ))
      ) : (
        <TableRow>
          <TableCell
            colSpan={columns.length}
            className="text-muted-foreground h-24 text-center"
          >
            {noResultsText}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  filterPlaceholder = "Search...",
  noResultsText = "No results.",
  initialPageSize = 10,
  getRowCanExpand,
  renderSubComponent,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    state: { pagination, globalFilter, expanded },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    globalFilterFn: "auto",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder={filterPlaceholder}
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="w-full sm:max-w-sm"
        />
        <div className="text-muted-foreground text-xs">
          {table.getFilteredRowModel().rows.length} row(s)
        </div>
      </div>

      <div className="overflow-hidden border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <DataTableBody<TData, TValue>
            table={table}
            columns={columns}
            noResultsText={noResultsText}
            renderSubComponent={renderSubComponent}
          />
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}

export function ServerDataTable<TData, TValue = unknown>({
  columns,
  data,
  filterPlaceholder = "Search...",
  noResultsText = "No results.",
  pageCount,
  totalRows,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchValue = "",
  onSearchChange,
  isLoading,
  getRowCanExpand,
  renderSubComponent,
}: ServerDataTableProps<TData, TValue>) {
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const pagination: PaginationState = { pageIndex, pageSize };

  const table = useReactTable({
    data,
    columns,
    state: { pagination, globalFilter: searchValue, expanded },
    manualPagination: true,
    pageCount,
    rowCount: totalRows,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      if (next.pageSize !== pageSize) {
        onPageSizeChange?.(next.pageSize);
      }
      if (next.pageIndex !== pageIndex) {
        onPageChange(next.pageIndex);
      }
    },
    onGlobalFilterChange: (value) => onSearchChange?.(value),
    onExpandedChange: setExpanded,
    globalFilterFn: "auto",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder={filterPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          className="w-full sm:max-w-sm"
        />
        <div className="text-muted-foreground text-xs">
          {totalRows ?? data.length} row(s)
        </div>
      </div>

      <div className="overflow-hidden border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <DataTableBody<TData, TValue>
            table={table}
            columns={columns}
            isLoading={isLoading}
            noResultsText={noResultsText}
            renderSubComponent={renderSubComponent}
          />
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
