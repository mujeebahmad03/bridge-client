"use client";

import { useEffect, useRef } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

import { useEditableCellController } from "@/leads/hooks/contacts";
import type { ContactColumn } from "@/leads/types";

interface EditableCellProps {
  contactId: string;
  value: string;
  column: ContactColumn;
}

export const EditableCell = ({
  contactId,
  value,
  column,
}: EditableCellProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  const {
    isActive,
    isEditing,
    editValue,
    handleKeyDown,
    handleDoubleClick,
    handleBlur,
    handleSelectValueChange,
    handleInputChange,
  } = useEditableCellController({ contactId, column, value });

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Scroll active cell into view and focus it when it becomes active (if not editing)
  useEffect(() => {
    if (isActive && cellRef.current && !isEditing) {
      cellRef.current.scrollIntoView({ block: "nearest", inline: "nearest" });
      // Focus the cell when it becomes active (for keyboard navigation)
      cellRef.current.focus();
    }
  }, [isActive, isEditing]);

  // Render select dropdown for select type columns
  if ((column.type === "select" || column.type === "boolean") && isEditing) {
    return (
      <div
        ref={cellRef}
        className={cn(
          "h-full w-full min-h-[36px]",
          isActive && "ring-2 ring-primary ring-inset"
        )}
      >
        <Select value={editValue} onValueChange={handleSelectValueChange} open>
          <SelectTrigger className="h-full w-full border-0 rounded-none bg-transparent focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {column.type === "boolean" ? (
              <>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </>
            ) : (
              column.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Render input for editing
  if (isEditing) {
    return (
      <div
        ref={cellRef}
        className={cn(
          "h-full w-full",
          isActive && "ring-2 ring-primary ring-inset"
        )}
      >
        <Input
          ref={inputRef}
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="h-full w-full border-0 rounded-none bg-background focus-visible:ring-0 focus-visible:ring-offset-0 px-3"
          type={
            column.type === "email"
              ? "email"
              : column.type === "phone"
                ? "tel"
                : "text"
          }
        />
      </div>
    );
  }

  // Render display value
  return (
    <div
      ref={cellRef}
      tabIndex={isActive ? 0 : -1}
      className={cn(
        "h-full w-full min-h-[36px] px-3 py-2 flex items-center cursor-default",
        "text-sm truncate select-none",
        "transition-colors duration-75",
        isActive && "ring-2 ring-primary ring-inset bg-primary/5",
        !isActive && "hover:bg-muted/50",
        column.type === "readonly" && "text-muted-foreground"
      )}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
    >
      {column.type === "select"
        ? (column.options?.find((o) => o.value === value)?.label ?? value)
        : value || <span className="text-muted-foreground/50">—</span>}
    </div>
  );
};
