import { type Table } from "@tanstack/react-table";
import { Download, MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface BulkAction<TData> {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (selectedRows: TData[]) => void;
  variant?: "default" | "destructive";
}

interface DataTableBulkActionsProps<TData> {
  table: Table<TData>;
  actions?: BulkAction<TData>[];
}

const defaultActions: BulkAction<unknown>[] = [
  {
    id: "export",
    label: "Export Selected",
    icon: Download,
    onClick: (rows) => {
      console.log("Exporting rows:", rows);
    },
  },
  {
    id: "delete",
    label: "Delete Selected",
    icon: Trash2,
    onClick: (rows) => {
      console.log("Deleting rows:", rows);
    },
    variant: "destructive",
  },
];

export function DataTableBulkActions<TData>({
  table,
  actions = defaultActions as BulkAction<TData>[],
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  if (selectedCount === 0) {
    return null;
  }

  const handleAction = (action: BulkAction<TData>) => {
    const data = selectedRows.map((row) => row.original);
    action.onClick(data);
  };

  // Show first 2 actions as buttons, rest in dropdown
  const visibleActions = actions.slice(0, 2);
  const overflowActions = actions.slice(2);

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-accent/50 border-b border-border animate-slide-in">
      <span className="text-sm font-medium text-foreground">
        {selectedCount} selected
      </span>

      <div className="flex items-center gap-2 ml-auto">
        {visibleActions.map((action) => (
          <Button
            key={action.id}
            variant={
              action.variant === "destructive" ? "destructive" : "outline"
            }
            size="sm"
            className="h-8 gap-2"
            onClick={() => handleAction(action)}
          >
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label}
          </Button>
        ))}

        {overflowActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {overflowActions.map((action, index) => (
                <div key={action.id}>
                  {index > 0 && action.variant === "destructive" && (
                    <DropdownMenuSeparator />
                  )}
                  <DropdownMenuItem
                    onClick={() => handleAction(action)}
                    className={
                      action.variant === "destructive"
                        ? "text-destructive focus:text-destructive"
                        : ""
                    }
                  >
                    {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => table.toggleAllRowsSelected(false)}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
