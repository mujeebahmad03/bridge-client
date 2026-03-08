import { Download, Plus, Search, Settings2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { useContactTableToolbarController } from "@/leads/hooks/contacts";

export const ContactTableToolbar = () => {
  const {
    columns,
    searchValue,
    visibleColumnIds,
    selectedCount,
    setSearchValue,
    toggleColumn,
    openAddDialog,
    handleDeleteSelected,
    handleExportSelected,
  } = useContactTableToolbarController();

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4 px-4">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 w-full sm:w-[280px]"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Settings2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={visibleColumnIds.has(column.id)}
                onCheckedChange={() => toggleColumn(column.id)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {selectedCount > 0 && (
          <>
            <span className="text-sm text-muted-foreground mr-2">
              {selectedCount} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSelected}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </>
        )}

        <Button onClick={openAddDialog} size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add Contact</span>
        </Button>
      </div>
    </div>
  );
};
