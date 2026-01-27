import { Plus, SearchX, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ContactTableEmptyStateRowProps {
  colSpan: number;
  isSearching: boolean;
  onAddContact: () => void;
  onClearSearch: () => void;
}

export function ContactTableEmptyStateRow({
  colSpan,
  isSearching,
  onAddContact,
  onClearSearch,
}: ContactTableEmptyStateRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <div className="flex flex-col items-center justify-center min-h-[300px] py-16 px-4">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            {isSearching ? (
              <>
                <div className="rounded-full bg-muted p-4">
                  <SearchX className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No contacts found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search terms or filters to find what
                    you're looking for.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearSearch}
                    className="gap-1.5"
                  >
                    <SearchX className="h-3.5 w-3.5" />
                    Clear search
                  </Button>
                  <Button size="sm" onClick={onAddContact} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Add Contact
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-full bg-muted p-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No contacts yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Get started by adding your first contact to the list.
                  </p>
                </div>
                <div className="mt-2">
                  <Button size="sm" onClick={onAddContact} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Add Contact
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
