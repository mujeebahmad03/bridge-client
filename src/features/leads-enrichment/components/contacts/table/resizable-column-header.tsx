import { type SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  GripVertical,
  Pin,
  PinOff,
} from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { cn } from "@/lib/utils";

import {
  useColumnHeaderActions,
  useResizableColumnHeader,
} from "@/leads/hooks";
import type { ContactColumn, Side } from "@/leads/types";

interface ResizableColumnHeaderProps {
  column: ContactColumn;
  children: React.ReactNode;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  isPinned?: boolean;
  pinnedSide?: Side | null;
  // Sortable props (from @dnd-kit)
  sortableRef?: (node: HTMLElement | null) => void;
  sortableAttributes?: React.HTMLAttributes<HTMLElement>;
  sortableListeners?: SyntheticListenerMap;
  sortableStyle?: React.CSSProperties;
  isDragging?: boolean;
  stickyStyle?: React.CSSProperties;
}

export const ResizableColumnHeader = ({
  column,
  children,
  onClick,
  onKeyDown,
  isPinned = false,
  pinnedSide = null,
  sortableRef,
  sortableAttributes,
  sortableListeners,
  sortableStyle,
  isDragging = false,
  stickyStyle,
}: ResizableColumnHeaderProps) => {
  const { width, isResizing, handleResizeStart, handleResizeKeyDown } =
    useResizableColumnHeader(column);

  const {
    isSorted,
    isAsc,
    isDesc,
    handleSortClick,
    handlePinLeft,
    handlePinRight,
    handleUnpin,
  } = useColumnHeaderActions(column);

  return (
    <th
      ref={sortableRef}
      tabIndex={0}
      style={{
        width,
        minWidth: width,
        maxWidth: width,
        ...sortableStyle,
        ...stickyStyle,
      }}
      className={cn(
        "relative border-r border-border p-0 text-left group cursor-pointer transition-colors",
        "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
        isResizing && "bg-muted/60",
        isDragging && "opacity-50 z-50",
        stickyStyle && "sticky z-20 bg-muted/80 backdrop-blur-sm"
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...sortableAttributes}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="h-10 px-3 flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider overflow-hidden">
            {/* Drag handle */}
            <div
              className={cn(
                "cursor-grab active:cursor-grabbing p-0.5 -ml-1 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-muted touch-none",
                isDragging && "opacity-100"
              )}
              {...sortableListeners}
            >
              <GripVertical className="h-3.5 w-3.5" />
            </div>

            <span className="truncate flex-1">{children}</span>

            <div className="flex items-center gap-1 shrink-0">
              {isPinned && (
                <span
                  className={cn(
                    "text-[10px] px-1 py-0.5 rounded",
                    pinnedSide === "left" && "bg-primary/10 text-primary",
                    pinnedSide === "right" && "bg-secondary/10 text-secondary"
                  )}
                >
                  {pinnedSide === "left" ? "L" : "R"}
                </span>
              )}
              <button
                type="button"
                onClick={handleSortClick}
                className={cn(
                  "p-0.5 hover:bg-muted rounded transition-colors",
                  isSorted && "text-primary"
                )}
                aria-label={`Sort by ${column.label}`}
              >
                {isAsc ? (
                  <ArrowUp className="h-3.5 w-3.5" />
                ) : isDesc ? (
                  <ArrowDown className="h-3.5 w-3.5" />
                ) : (
                  <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                )}
              </button>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {isPinned ? (
            <ContextMenuItem onClick={handleUnpin}>
              <PinOff className="h-4 w-4 mr-2" />
              Unpin column
            </ContextMenuItem>
          ) : (
            <>
              <ContextMenuItem onClick={handlePinLeft}>
                <Pin className="h-4 w-4 mr-2" />
                Pin to left
              </ContextMenuItem>
              <ContextMenuItem onClick={handlePinRight}>
                <Pin className="h-4 w-4 mr-2" />
                Pin to right
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {/* Resize handle */}
      <div
        data-resize-handle
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize ${column.label} column`}
        tabIndex={0}
        className={cn(
          "absolute right-0 top-0 h-full w-1 cursor-col-resize z-10",
          "hover:bg-primary/50 active:bg-primary/70",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
          "before:absolute before:inset-y-0 before:-left-1 before:-right-1",
          isResizing && "bg-primary/70"
        )}
        onMouseDown={handleResizeStart}
        onKeyDown={handleResizeKeyDown}
        onClick={(e) => e.stopPropagation()}
      />
    </th>
  );
};
