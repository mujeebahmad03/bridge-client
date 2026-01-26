import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ResizableColumnHeader } from "./resizable-column-header";
import { useContactsTableStore } from "@/leads/stores";
import type { ContactColumn, Side } from "@/leads/types";

interface SortableColumnHeaderProps {
  column: ContactColumn;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const SortableColumnHeader = ({
  column,
  onClick,
  onKeyDown,
}: SortableColumnHeaderProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  // Use selector to get pinned state directly (useShallow for stable array comparison)
  const pinnedColumns = useContactsTableStore(
    useShallow((s) => s.pinnedColumns)
  );
  const pinnedSide = useMemo(() => {
    if (pinnedColumns.left.includes(column.id)) {
      return "left" as Side;
    }
    if (pinnedColumns.right.includes(column.id)) {
      return "right" as Side;
    }
    return null;
  }, [pinnedColumns, column.id]);

  const isPinned = pinnedSide !== null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ResizableColumnHeader
      column={column}
      onClick={onClick}
      onKeyDown={onKeyDown}
      isPinned={isPinned}
      pinnedSide={pinnedSide}
      sortableRef={setNodeRef}
      sortableAttributes={attributes}
      sortableListeners={listeners}
      sortableStyle={style}
      isDragging={isDragging}
    >
      {column.label}
    </ResizableColumnHeader>
  );
};
