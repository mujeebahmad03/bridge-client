import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { type ReactNode, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";

import {
  type BulkAction,
  DataTableBulkActions,
} from "./data-table-bulk-actions";
import { DataTablePagination } from "./data-table-pagination";
import {
  DataTableToolbar,
  type FacetedFilterConfig,
} from "./data-table-toolbar";
import { DataTableSkeleton } from "./loading-state";

// ==================== Types ====================
export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];

  // Search
  searchPlaceholder?: string;
  showSearch?: boolean;
  onSearchChange?: (search: string) => void;

  // Features
  showPagination?: boolean;
  showColumnVisibility?: boolean;
  enableRowSelection?: boolean;

  // Faceted filters
  facetedFilters?: FacetedFilterConfig[];

  // Bulk actions
  bulkActions?: BulkAction<TData>[];

  // Pagination
  pageSize?: number;
  pageSizeOptions?: number[];

  // Server-side
  serverSidePagination?: boolean;
  currentPage?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;

  // UI
  isLoading?: boolean;
  emptyMessage?: string;
  headerContent?: ReactNode;
  className?: string;
}

// ==================== Selection Column ====================
export function getSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

// ==================== Data Table ====================
export function NewDataTable<TData>({
  data,
  columns,
  searchPlaceholder = "Search...",
  showSearch = true,
  showPagination = true,
  showColumnVisibility = true,
  enableRowSelection = false,
  facetedFilters = [],
  bulkActions,
  pageSize = 10,
  pageSizeOptions,
  serverSidePagination = false,
  currentPage = 1,
  totalCount,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  isLoading = false,
  emptyMessage = "No results found",
  headerContent,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // Add selection column if enabled
  const tableColumns = enableRowSelection
    ? [getSelectionColumn<TData>(), ...columns]
    : columns;

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: serverSidePagination
        ? { pageIndex: currentPage - 1, pageSize }
        : pagination,
    },
    enableRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: serverSidePagination ? undefined : setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: serverSidePagination
      ? undefined
      : getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: serverSidePagination,
    pageCount:
      serverSidePagination && totalCount
        ? Math.ceil(totalCount / pageSize)
        : undefined,
  });

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    onSearchChange?.(value);
  };

  const totalRows = serverSidePagination
    ? (totalCount ?? 0)
    : table.getFilteredRowModel().rows.length;

  const showToolbar =
    showSearch ||
    showColumnVisibility ||
    facetedFilters.length > 0 ||
    headerContent;
  const showBulkActions =
    enableRowSelection && table.getFilteredSelectedRowModel().rows.length > 0;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card shadow-soft",
        className
      )}
    >
      {showToolbar && (
        <DataTableToolbar
          table={table}
          globalFilter={globalFilter}
          onGlobalFilterChange={handleSearchChange}
          searchPlaceholder={searchPlaceholder}
          showSearch={showSearch}
          showColumnVisibility={showColumnVisibility}
          facetedFilters={facetedFilters}
          headerContent={headerContent}
        />
      )}

      {showBulkActions && (
        <DataTableBulkActions table={table} actions={bulkActions} />
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-11">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <DataTableSkeleton columns={tableColumns.length} rows={10} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  <p className="text-muted-foreground">{emptyMessage}</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && totalRows > 0 && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          serverSide={serverSidePagination}
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
