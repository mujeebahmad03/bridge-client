"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTableEmpty } from "./empty-state";
import { DataTableSkeleton } from "./loading-state";
import { DataTablePagination } from "./pagination";
import { DataTableToolbar } from "./tool-bar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  onBulkAction?: (action: string, rows: Row<TData>[]) => void;
  bulkActions?: Array<{ label: string; value: string }>;
  rowHeight?: "compact" | "default" | "comfortable";
  filters?: Array<{
    column: string;
    title: string;
    options: Array<{
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }>;
  }>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  isLoading = false,
  onBulkAction,
  bulkActions,
  rowHeight = "default",
  filters,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    getFacetedUniqueValues: (table, columnId) => () => {
      const uniqueValues = new Map<unknown, number>();
      const { rows } = table.getFilteredRowModel();
      rows.forEach((row) => {
        const value = row.getValue(columnId);
        uniqueValues.set(value, (uniqueValues.get(value) ?? 0) + 1);
      });
      return uniqueValues;
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const rowHeightClasses = {
    compact: "h-8",
    default: "h-12",
    comfortable: "h-16",
  };

  const cellPaddingClasses = {
    compact: "py-1 text-sm",
    default: "py-2",
    comfortable: "py-4 text-base",
  };

  if (isLoading) {
    return <DataTableSkeleton columns={columns.length} />;
  }

  return (
    <div className="space-y-4 relative">
      <DataTableToolbar
        table={table}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        selectedRows={selectedRows}
        onBulkAction={onBulkAction}
        bulkActions={bulkActions}
        filters={filters}
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className={rowHeightClasses[rowHeight]}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cellPaddingClasses[rowHeight]}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={rowHeightClasses[rowHeight]}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cellPaddingClasses[rowHeight]}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <DataTableEmpty />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
