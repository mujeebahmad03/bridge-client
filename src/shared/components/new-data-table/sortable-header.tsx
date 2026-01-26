import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

// ==================== Sortable Header ====================
interface SortableHeaderProps {
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
  };
  title: string;
}

export function SortableHeader({ column, title }: SortableHeaderProps) {
  const sorted = column.getIsSorted();

  return (
    <button
      className="flex items-center gap-1 hover:text-foreground transition-colors -ml-2 px-2 py-1 rounded"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "asc" ? (
        <ChevronUp className="h-4 w-4" />
      ) : sorted === "desc" ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </button>
  );
}
