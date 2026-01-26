"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { Checkbox } from "@/components/ui/checkbox";

import { cn } from "@/lib/utils";

import { ColumnSheet } from "../columns";
import { AddContactDialog } from "../dialogs";
import { ContactTableRow } from "./contact-table-row";
import { ContactTableToolbar } from "./contact-table-toolbar";
import { ResizableColumnHeader } from "./resizable-column-header";
import { SortableColumnHeader } from "./sortable-column-header";
import { useContactTableController } from "@/leads/hooks/contacts";
import { useContactsTableStore } from "@/leads/stores";

const ROW_HEIGHT = 20;

export const ContactTable = () => {
  const {
    contacts,
    visibleColumnsList,
    pinnedLeftColumns,
    unpinnedColumns,
    pinnedRightColumns,
    virtualItems,
    paddingTop,
    paddingBottom,
    tableRef,
    scrollRef,
    allSelected,
    someSelected,
    isColumnSheetOpen,
    handleSelectAll,
    openAddColumnSheet,
    openEditColumnSheet,
    handleColumnHeaderKeyDown,
    handleAddColumnHeaderKeyDown,
    handleTableKeyDown,
    getLeftOffset,
    getRightOffset,
  } = useContactTableController();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const setColumnOrder = useContactsTableStore((s) => s.setColumnOrder);
  const currentColumnOrder = useContactsTableStore(
    useShallow((s) => s.columnOrder)
  );
  const pinnedColumns = useContactsTableStore(
    useShallow((s) => s.pinnedColumns)
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      // Only handle drag for unpinned columns
      const oldIndex = unpinnedColumns.findIndex((c) => c.id === active.id);
      const newIndex = unpinnedColumns.findIndex((c) => c.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      // Get the new order of unpinned columns
      const newUnpinnedOrder = arrayMove(unpinnedColumns, oldIndex, newIndex);
      const newUnpinnedIds = newUnpinnedOrder.map((c) => c.id);

      // Merge with existing order: pinned left + new unpinned + pinned right
      // First, get all pinned column IDs in their current order
      const pinnedLeftIds = pinnedColumns.left.filter((id) =>
        currentColumnOrder.includes(id)
      );
      const pinnedRightIds = pinnedColumns.right.filter((id) =>
        currentColumnOrder.includes(id)
      );

      // Build the new full order: pinned left + new unpinned + pinned right
      const newFullOrder = [
        ...pinnedLeftIds,
        ...newUnpinnedIds,
        ...pinnedRightIds,
      ];

      // Also include any columns that might not be in any of these categories
      // (e.g., hidden columns that should maintain their position)
      const remainingColumns = currentColumnOrder.filter(
        (id) =>
          !pinnedLeftIds.includes(id) &&
          !pinnedRightIds.includes(id) &&
          !newUnpinnedIds.includes(id)
      );

      // Insert remaining columns at the end (or we could try to preserve their relative positions)
      const finalOrder = [...newFullOrder, ...remainingColumns];

      // Update column order in store
      setColumnOrder(finalOrder);
    },
    [
      unpinnedColumns,
      setColumnOrder,
      currentColumnOrder,
      pinnedColumns.left,
      pinnedColumns.right,
    ]
  );

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full",
        // On larger screens, reserve space so the sheet doesn't cover the table.
        isColumnSheetOpen && "md:pr-128 transition-[padding] duration-300"
      )}
    >
      <ContactTableToolbar />

      <div
        ref={tableRef}
        tabIndex={0}
        onKeyDown={handleTableKeyDown}
        className="flex-1 border border-border rounded-lg overflow-hidden bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <div
          ref={scrollRef}
          className="h-[calc(100vh-340px)] min-h-[300px] overflow-auto"
        >
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-20 bg-muted/80 backdrop-blur-sm">
              <tr className="border-b border-border">
                {/* Row number & select all header */}
                <th className="sticky left-0 z-30 bg-muted/80 backdrop-blur-sm border-r border-border w-[60px] min-w-[60px] p-0">
                  <div className="flex items-center justify-center h-10 px-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      className={cn(
                        "transition-opacity",
                        someSelected && "data-[state=unchecked]:bg-primary/50"
                      )}
                    />
                  </div>
                </th>

                {/* Pinned left columns */}
                {pinnedLeftColumns.map((column, index) => {
                  const leftOffset = getLeftOffset(index);
                  return (
                    <ResizableColumnHeader
                      key={column.id}
                      column={column}
                      onClick={() => openEditColumnSheet(column)}
                      onKeyDown={(e) => handleColumnHeaderKeyDown(e, column)}
                      isPinned={true}
                      pinnedSide="left"
                      stickyStyle={{ left: `${leftOffset}px` }}
                    >
                      {column.label}
                    </ResizableColumnHeader>
                  );
                })}

                {/* Unpinned columns (sortable) */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={unpinnedColumns.map((c) => c.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {unpinnedColumns.map((column) => (
                      <SortableColumnHeader
                        key={column.id}
                        column={column}
                        onClick={() => openEditColumnSheet(column)}
                        onKeyDown={(e) => handleColumnHeaderKeyDown(e, column)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                {/* Pinned right columns */}
                {pinnedRightColumns.map((column, index) => {
                  const rightOffset = getRightOffset(index);
                  return (
                    <ResizableColumnHeader
                      key={column.id}
                      column={column}
                      onClick={() => openEditColumnSheet(column)}
                      onKeyDown={(e) => handleColumnHeaderKeyDown(e, column)}
                      isPinned={true}
                      pinnedSide="right"
                      stickyStyle={{ right: `${rightOffset}px` }}
                    >
                      {column.label}
                    </ResizableColumnHeader>
                  );
                })}

                {/* Add Column header */}
                <th
                  tabIndex={0}
                  className="border-r border-border p-0 w-[50px] min-w-[50px] cursor-pointer hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                  onClick={openAddColumnSheet}
                  onKeyDown={handleAddColumnHeaderKeyDown}
                >
                  <div className="h-10 px-3 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                </th>

                {/* Empty header for remaining space */}
                <th className="w-full" />
              </tr>
            </thead>

            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumnsList.length + 2}
                    className="text-center py-12"
                  >
                    <div className="text-muted-foreground">
                      No contacts found
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {paddingTop > 0 && (
                    <tr>
                      <td
                        colSpan={visibleColumnsList.length + 2}
                        style={{ height: paddingTop }}
                        className="p-0"
                        aria-hidden
                      />
                    </tr>
                  )}
                  {virtualItems.map((virtualRow) => {
                    const contact = contacts[virtualRow.index];
                    return (
                      <ContactTableRow
                        key={contact.id}
                        contact={contact}
                        rowIndex={virtualRow.index}
                        rowStyle={{ height: ROW_HEIGHT }}
                        visibleColumns={visibleColumnsList}
                      />
                    );
                  })}
                  {paddingBottom > 0 && (
                    <tr>
                      <td
                        colSpan={visibleColumnsList.length + 2}
                        style={{ height: paddingBottom }}
                        className="p-0"
                        aria-hidden
                      />
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer hint */}
      <div className="text-xs text-muted-foreground text-center pb-2">
        Double-click or press Enter to edit • Arrow keys to navigate • Enter on
        header to configure column • Esc to cancel
      </div>

      {/* Add Contact Dialog */}
      <AddContactDialog />

      {/* Column Sheet */}
      <ColumnSheet />
    </div>
  );
};
