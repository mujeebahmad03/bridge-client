import { type Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  // Server-side pagination props
  serverSide?: boolean;
  currentPage?: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
  serverSide = false,
  currentPage = 1,
  totalCount = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  // Calculate pagination values
  const totalRows = serverSide
    ? totalCount
    : table.getFilteredRowModel().rows.length;

  const pageIndex = serverSide
    ? currentPage - 1
    : table.getState().pagination.pageIndex;

  const currentPageSize = serverSide
    ? pageSize
    : table.getState().pagination.pageSize;

  const pageCount = serverSide
    ? Math.ceil(totalCount / pageSize)
    : table.getPageCount();

  const showingFrom = totalRows > 0 ? pageIndex * currentPageSize + 1 : 0;
  const showingTo = Math.min((pageIndex + 1) * currentPageSize, totalRows);

  const canPreviousPage = serverSide
    ? currentPage > 1
    : table.getCanPreviousPage();

  const canNextPage = serverSide
    ? currentPage < pageCount
    : table.getCanNextPage();

  const handleFirstPage = () => {
    if (serverSide) {
      onPageChange?.(1);
    } else {
      table.setPageIndex(0);
    }
  };

  const handlePreviousPage = () => {
    if (serverSide) {
      onPageChange?.(currentPage - 1);
    } else {
      table.previousPage();
    }
  };

  const handleNextPage = () => {
    if (serverSide) {
      onPageChange?.(currentPage + 1);
    } else {
      table.nextPage();
    }
  };

  const handleLastPage = () => {
    if (serverSide) {
      onPageChange?.(pageCount);
    } else {
      table.setPageIndex(pageCount - 1);
    }
  };

  const handlePageSizeChange = (value: string) => {
    const newSize = Number(value);
    if (serverSide) {
      onPageSizeChange?.(newSize);
    } else {
      table.setPageSize(newSize);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border-t border-border">
      {/* Mobile: Stack everything, Desktop: Side by side */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Info section */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
          {selectedCount > 0 && (
            <span className="whitespace-nowrap">
              {selectedCount} of {totalRows} selected
            </span>
          )}
          <span className="whitespace-nowrap">
            {showingFrom}-{showingTo} of {totalRows}
          </span>
        </div>

        {/* Controls section */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          {/* Rows per page - hidden on very small screens */}
          <div className="hidden xs:flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Rows
            </span>
            <Select
              value={String(currentPageSize)}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[60px]">
                <SelectValue placeholder={currentPageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page indicator */}
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {pageIndex + 1}/{pageCount || 1}
          </span>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hidden sm:inline-flex"
              onClick={handleFirstPage}
              disabled={!canPreviousPage}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handlePreviousPage}
              disabled={!canPreviousPage}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleNextPage}
              disabled={!canNextPage}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hidden sm:inline-flex"
              onClick={handleLastPage}
              disabled={!canNextPage}
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile-only rows per page selector */}
      <div className="flex xs:hidden items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">Rows per page</span>
        <Select
          value={String(currentPageSize)}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={currentPageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
