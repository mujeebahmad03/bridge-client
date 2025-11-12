import { FileQuestion } from "lucide-react";

export function DataTableEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-1">No results found</h3>
      <p className="text-sm text-muted-foreground">
        Try adjusting your search or filters to find what you&apos;re looking
        for.
      </p>
    </div>
  );
}
