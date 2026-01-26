import { useCallback } from "react";

import { useUpdateContactFieldMutation } from "./use-contacts-api";
import { useContactsTableStore } from "@/leads/stores";
import type { ContactColumn } from "@/leads/types";

function parseBoolean(input: string): boolean {
  const v = input.trim().toLowerCase();
  return v === "yes" || v === "true" || v === "1" || v === "y";
}

export function useEditableCellController({
  contactId,
  column,
  value,
}: {
  contactId: string;
  column: ContactColumn;
  value: string;
}) {
  const isActive = useContactsTableStore(
    (s) =>
      s.activeCell?.rowId === contactId && s.activeCell?.columnId === column.id
  );

  const isEditing = useContactsTableStore(
    (s) =>
      s.editingCell?.rowId === contactId &&
      s.editingCell?.columnId === column.id
  );

  const editValue = useContactsTableStore((s) =>
    s.editingCell?.rowId === contactId && s.editingCell?.columnId === column.id
      ? s.editValue
      : value
  );

  const updateFieldMutation = useUpdateContactFieldMutation();

  const commit = useCallback(() => {
    const state = useContactsTableStore.getState();
    if (!state.editingCell) {
      return;
    }
    // Only commit if this cell is currently being edited.
    if (
      state.editingCell.rowId !== contactId ||
      state.editingCell.columnId !== column.id
    ) {
      return;
    }

    const commitValue =
      column.type === "boolean"
        ? parseBoolean(state.editValue)
        : state.editValue;

    updateFieldMutation.mutate({
      contactId,
      fieldId: column.id,
      value: commitValue,
    });

    state.stopEditing();
  }, [contactId, column.id, column.type, updateFieldMutation]);

  const cancel = useCallback(() => {
    useContactsTableStore.getState().stopEditing();
  }, []);

  const handleStartEdit = useCallback(() => {
    useContactsTableStore
      .getState()
      .startEditing({ rowId: contactId, columnId: column.id }, value);
  }, [contactId, column.id, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isEditing) {
        switch (e.key) {
          case "Enter":
            e.preventDefault();
            commit();
            break;
          case "Escape":
            e.preventDefault();
            cancel();
            break;
          case "Tab":
            e.preventDefault();
            commit();
            useContactsTableStore
              .getState()
              .moveActiveCell(e.shiftKey ? "left" : "right");
            break;
        }
      } else if (isActive) {
        switch (e.key) {
          case "Enter":
          case "F2":
            e.preventDefault();
            handleStartEdit();
            break;
          case "ArrowUp":
            e.preventDefault();
            useContactsTableStore.getState().moveActiveCell("up");
            break;
          case "ArrowDown":
            e.preventDefault();
            useContactsTableStore.getState().moveActiveCell("down");
            break;
          case "ArrowLeft":
            e.preventDefault();
            useContactsTableStore.getState().moveActiveCell("left");
            break;
          case "ArrowRight":
            e.preventDefault();
            useContactsTableStore.getState().moveActiveCell("right");
            break;
          case "Tab":
            e.preventDefault();
            useContactsTableStore
              .getState()
              .moveActiveCell(e.shiftKey ? "left" : "right");
            break;
          default:
            // Start editing on any printable character
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
              useContactsTableStore
                .getState()
                .startEditing({ rowId: contactId, columnId: column.id }, e.key);
            }
        }
      }
    },
    [isEditing, isActive, commit, cancel, handleStartEdit, contactId, column.id]
  );

  const handleDoubleClick = useCallback(() => {
    if (column.type !== "readonly") {
      handleStartEdit();
    }
  }, [column.type, handleStartEdit]);

  const handleBlur = useCallback(() => {
    if (isEditing) {
      commit();
    }
  }, [isEditing, commit]);

  const handleSelectValueChange = useCallback(
    (val: string) => {
      useContactsTableStore.getState().setEditValue(val);
      commit();
    },
    [commit]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      useContactsTableStore.getState().setEditValue(e.target.value);
    },
    []
  );

  return {
    isActive,
    isEditing,
    editValue,
    commit,
    cancel,
    handleStartEdit,
    handleKeyDown,
    handleDoubleClick,
    handleBlur,
    handleSelectValueChange,
    handleInputChange,
  };
}
