import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import type {
  CellPosition,
  ContactColumn,
  ContactFieldId,
  Side,
} from "@/leads/types";
import {
  DEFAULT_VISIBLE_COLUMN_IDS,
  SYSTEM_CONTACT_COLUMNS,
} from "@/leads/types";

// ==================== Store Types ====================

interface ContactsTableState {
  // Search / filters
  searchValue: string;

  // Column visibility (IDs only)
  visibleColumnIds: Set<ContactFieldId>;

  // Column widths (overrides default widths)
  columnWidths: Map<ContactFieldId, number>;

  // Column sorting
  sortColumn: ContactFieldId | null;
  sortDirection: "asc" | "desc" | null;

  // Column order (only for data columns, excludes selector/add columns)
  columnOrder: ContactFieldId[];

  // Pinned columns (only for data columns)
  pinnedColumns: { left: ContactFieldId[]; right: ContactFieldId[] };

  // Row selection
  selectedRowIds: Set<string>;

  // Active/editing cell state
  activeCell: CellPosition | null;
  editingCell: CellPosition | null;
  editValue: string;

  // Dialogs / sheets
  isAddDialogOpen: boolean;
  isColumnSheetOpen: boolean;
  columnSheetMode: "add" | "edit";
  selectedSheetColumn: ContactColumn | null;

  // Navigation model (derived from current list + visible columns order)
  navigationContactIds: string[];
  navigationColumnIds: ContactFieldId[];

  // Hydration flag for SSR
  _hasHydrated: boolean;
}

interface ContactsTableActions {
  setSearchValue: (value: string) => void;

  toggleColumn: (columnId: ContactFieldId) => void;
  setVisibleColumns: (ids: ContactFieldId[]) => void;

  setColumnWidth: (columnId: ContactFieldId, width: number) => void;
  getColumnWidth: (columnId: ContactFieldId, defaultWidth?: number) => number;

  // Column sorting
  setSortColumn: (
    columnId: ContactFieldId | null,
    direction?: "asc" | "desc"
  ) => void;
  toggleSortColumn: (columnId: ContactFieldId) => void;

  // Column ordering
  setColumnOrder: (order: ContactFieldId[]) => void;
  moveColumn: (fromIndex: number, toIndex: number) => void;

  // Column pinning
  pinColumn: (columnId: ContactFieldId, side: Side) => void;
  unpinColumn: (columnId: ContactFieldId) => void;
  isPinned: (columnId: ContactFieldId) => { side: Side | null };

  toggleRowSelection: (contactId: string) => void;
  selectAllRows: (ids: string[]) => void;
  clearSelection: () => void;

  setActiveCell: (pos: CellPosition | null) => void;
  startEditing: (pos: CellPosition, initialValue: string) => void;
  setEditValue: (value: string) => void;
  stopEditing: () => void;

  moveActiveCell: (direction: "up" | "down" | Side) => void;
  setNavigationModel: (payload: {
    contactIds: string[];
    columnIds: ContactFieldId[];
  }) => void;

  openAddDialog: () => void;
  closeAddDialog: () => void;

  openAddColumnSheet: () => void;
  openEditColumnSheet: (column: ContactColumn) => void;
  setIsColumnSheetOpen: (open: boolean) => void;

  // Initialize with fetched columns (call after columns are loaded)
  initializeWithColumns: (columns: ContactColumn[]) => void;

  setHasHydrated: (value: boolean) => void;
}

type ContactsTableStore = ContactsTableState & ContactsTableActions;

// Use system column IDs for initial state
const INITIAL_COLUMN_ORDER = SYSTEM_CONTACT_COLUMNS.map(
  (c) => c.id
) as ContactFieldId[];

const initialState: ContactsTableState = {
  searchValue: "",
  visibleColumnIds: new Set(DEFAULT_VISIBLE_COLUMN_IDS as ContactFieldId[]),
  columnWidths: new Map(),
  sortColumn: null,
  sortDirection: null,
  columnOrder: INITIAL_COLUMN_ORDER,
  pinnedColumns: { left: [], right: [] },
  selectedRowIds: new Set(),
  activeCell: null,
  editingCell: null,
  editValue: "",
  isAddDialogOpen: false,
  isColumnSheetOpen: false,
  columnSheetMode: "add",
  selectedSheetColumn: null,
  navigationContactIds: [],
  navigationColumnIds: INITIAL_COLUMN_ORDER,
  _hasHydrated: false,
};

// Type for serialized persisted state (Set/Map converted to arrays)
type SerializedPersistedState = {
  state: {
    visibleColumnIds?: ContactFieldId[] | Set<ContactFieldId>;
    columnWidths?: [ContactFieldId, number][] | Map<ContactFieldId, number>;
    columnOrder?: ContactFieldId[];
    pinnedColumns?: { left: ContactFieldId[]; right: ContactFieldId[] };
    sortColumn?: ContactFieldId | null;
    sortDirection?: "asc" | "desc" | null;
  };
  version?: number;
};

// Custom storage handler for Set and Map serialization
const customStorage = {
  getItem: (name: string): SerializedPersistedState | null => {
    try {
      const str = localStorage.getItem(name);
      if (!str) {
        return null;
      }

      const parsed = JSON.parse(str) as SerializedPersistedState;
      if (!parsed?.state) {
        return null;
      }

      // Reconstruct Set from array
      if (Array.isArray(parsed.state.visibleColumnIds)) {
        parsed.state.visibleColumnIds = new Set(parsed.state.visibleColumnIds);
      }

      // Reconstruct Map from entries array
      if (Array.isArray(parsed.state.columnWidths)) {
        parsed.state.columnWidths = new Map(parsed.state.columnWidths);
      }

      return parsed;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: SerializedPersistedState): void => {
    try {
      const serialized: SerializedPersistedState = { ...value };
      if (serialized?.state) {
        // Convert Set to array
        if (serialized.state.visibleColumnIds instanceof Set) {
          serialized.state.visibleColumnIds = Array.from(
            serialized.state.visibleColumnIds
          ) as ContactFieldId[];
        }

        // Convert Map to entries array
        if (serialized.state.columnWidths instanceof Map) {
          serialized.state.columnWidths = Array.from(
            serialized.state.columnWidths.entries()
          ) as [ContactFieldId, number][];
        }
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(name, JSON.stringify(serialized));
      }
    } catch (error) {
      console.error("Error persisting state:", error);
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

export const useContactsTableStore = create<ContactsTableStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSearchValue: (value) => set({ searchValue: value }),

      toggleColumn: (columnId) =>
        set((state) => {
          const next = new Set(state.visibleColumnIds);
          if (next.has(columnId)) {
            next.delete(columnId);
          } else {
            next.add(columnId);
          }
          return { visibleColumnIds: next };
        }),

      setVisibleColumns: (ids) => set({ visibleColumnIds: new Set(ids) }),

      setColumnWidth: (columnId, width) =>
        set((state) => {
          const next = new Map(state.columnWidths);
          next.set(columnId, Math.max(50, width)); // minimum 50px
          return { columnWidths: next };
        }),

      getColumnWidth: (columnId, defaultWidth = 120) => {
        const state = get();
        return state.columnWidths.get(columnId) ?? defaultWidth;
      },

      setSortColumn: (columnId, direction) =>
        set((state) => {
          if (!columnId) {
            return { sortColumn: null, sortDirection: null };
          }
          const newDirection =
            direction ??
            (state.sortColumn === columnId && state.sortDirection === "asc"
              ? "desc"
              : "asc");
          return {
            sortColumn: columnId,
            sortDirection: newDirection,
          };
        }),

      toggleSortColumn: (columnId) =>
        set((state) => {
          if (state.sortColumn === columnId) {
            // Cycle: asc -> desc -> null
            if (state.sortDirection === "asc") {
              return { sortDirection: "desc" };
            } else if (state.sortDirection === "desc") {
              return { sortColumn: null, sortDirection: null };
            }
          }
          // New column: start with asc
          return {
            sortColumn: columnId,
            sortDirection: "asc",
          };
        }),

      setColumnOrder: (order) => set({ columnOrder: order }),

      moveColumn: (fromIndex, toIndex) =>
        set((state) => {
          const newOrder = [...state.columnOrder];
          const [moved] = newOrder.splice(fromIndex, 1);
          newOrder.splice(toIndex, 0, moved);
          return { columnOrder: newOrder };
        }),

      pinColumn: (columnId, side) =>
        set((state) => {
          const pinned = { ...state.pinnedColumns };

          // Remove from other side if already pinned
          pinned.left = pinned.left.filter((id) => id !== columnId);
          pinned.right = pinned.right.filter((id) => id !== columnId);

          // Add to requested side
          if (side === "left") {
            pinned.left.push(columnId);
          } else {
            pinned.right.push(columnId);
          }

          return { pinnedColumns: pinned };
        }),

      unpinColumn: (columnId) =>
        set((state) => {
          const pinned = {
            left: state.pinnedColumns.left.filter((id) => id !== columnId),
            right: state.pinnedColumns.right.filter((id) => id !== columnId),
          };
          return { pinnedColumns: pinned };
        }),

      isPinned: (columnId) => {
        const state = get();
        if (state.pinnedColumns.left.includes(columnId)) {
          return { side: "left" as const };
        }
        if (state.pinnedColumns.right.includes(columnId)) {
          return { side: "right" as const };
        }
        return { side: null };
      },

      toggleRowSelection: (contactId) =>
        set((state) => {
          const next = new Set(state.selectedRowIds);
          if (next.has(contactId)) {
            next.delete(contactId);
          } else {
            next.add(contactId);
          }
          return { selectedRowIds: next };
        }),

      selectAllRows: (ids) =>
        set((state) => ({
          selectedRowIds: new Set([...state.selectedRowIds, ...ids]),
        })),

      clearSelection: () => set({ selectedRowIds: new Set() }),

      setActiveCell: (pos) => set({ activeCell: pos }),

      startEditing: (pos, initialValue) =>
        set({
          activeCell: pos,
          editingCell: pos,
          editValue: initialValue,
        }),

      setEditValue: (value) => set({ editValue: value }),

      stopEditing: () => set({ editingCell: null, editValue: "" }),

      setNavigationModel: ({ contactIds, columnIds }) =>
        set({
          navigationContactIds: contactIds,
          navigationColumnIds: columnIds,
        }),

      moveActiveCell: (direction) =>
        set((state) => {
          const { activeCell, navigationContactIds, navigationColumnIds } =
            state;
          if (
            !activeCell ||
            navigationContactIds.length === 0 ||
            navigationColumnIds.length === 0
          ) {
            return state;
          }

          const currentRowIndex = navigationContactIds.findIndex(
            (id) => id === activeCell.rowId
          );
          const currentColIndex = navigationColumnIds.findIndex(
            (id) => id === activeCell.columnId
          );
          if (currentRowIndex === -1 || currentColIndex === -1) {
            return state;
          }

          let newRowIndex = currentRowIndex;
          let newColIndex = currentColIndex;

          switch (direction) {
            case "up":
              newRowIndex = Math.max(0, currentRowIndex - 1);
              break;
            case "down":
              newRowIndex = Math.min(
                navigationContactIds.length - 1,
                currentRowIndex + 1
              );
              break;
            case "left":
              newColIndex = Math.max(0, currentColIndex - 1);
              break;
            case "right":
              newColIndex = Math.min(
                navigationColumnIds.length - 1,
                currentColIndex + 1
              );
              break;
          }

          return {
            activeCell: {
              rowId: navigationContactIds[newRowIndex],
              columnId: navigationColumnIds[newColIndex],
            },
          };
        }),

      openAddDialog: () => set({ isAddDialogOpen: true }),
      closeAddDialog: () => set({ isAddDialogOpen: false }),

      openAddColumnSheet: () =>
        set({
          isColumnSheetOpen: true,
          columnSheetMode: "add",
          selectedSheetColumn: null,
        }),

      openEditColumnSheet: (column) =>
        set({
          isColumnSheetOpen: true,
          columnSheetMode: "edit",
          selectedSheetColumn: column,
        }),

      setIsColumnSheetOpen: (open) => set({ isColumnSheetOpen: open }),

      // Initialize column order with fetched columns (adds new columns to end)
      initializeWithColumns: (columns) =>
        set((state) => {
          const columnIds = columns.map((c) => c.id);
          const currentOrder = state.columnOrder;

          // Find new columns not in current order
          const newColumns = columnIds.filter(
            (id) => !currentOrder.includes(id)
          );

          // Only update if there are new columns
          if (newColumns.length === 0) {
            return state;
          }

          // Merge: keep existing order, add new columns at end
          const updatedOrder = [...currentOrder, ...newColumns];

          return { columnOrder: updatedOrder };
        }),

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "contacts-table-config",
      storage: customStorage,
      // Only persist column configuration state
      partialize: (state): Partial<ContactsTableState> => ({
        visibleColumnIds: state.visibleColumnIds,
        columnWidths: state.columnWidths,
        columnOrder: state.columnOrder,
        pinnedColumns: state.pinnedColumns,
        sortColumn: state.sortColumn,
        sortDirection: state.sortDirection,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// ==================== Selector Helpers ====================

export const useContactsTableUi = () =>
  useContactsTableStore(
    useShallow((s) => ({
      searchValue: s.searchValue,
      visibleColumnIds: s.visibleColumnIds,
      isColumnSheetOpen: s.isColumnSheetOpen,
      columnSheetMode: s.columnSheetMode,
      selectedSheetColumn: s.selectedSheetColumn,
      isAddDialogOpen: s.isAddDialogOpen,
    }))
  );
