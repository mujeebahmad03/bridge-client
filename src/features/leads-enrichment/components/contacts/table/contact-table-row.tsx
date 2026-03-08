import { memo, useMemo } from "react";

import { Checkbox } from "@/components/ui/checkbox";

import { cn } from "@/lib/utils";

import { EditableCell } from "./editable-cell";
import {
  useContactRowController,
  useIsCellEnriching,
} from "@/leads/hooks/contacts";
import { getContactFieldValue } from "@/leads/services";
import { useContactsTableStore } from "@/leads/stores";
import type { Contact, ContactColumn, ContactFieldId } from "@/leads/types";

/** Renders a single data cell so we can call useIsCellEnriching per cell */
const ContactTableCell = memo(
  ({
    contact,
    column,
    cellValue,
    width,
    stickyStyle,
    onCellClick,
  }: {
    contact: Contact;
    column: ContactColumn;
    cellValue: string;
    width: number;
    stickyStyle?: React.CSSProperties;
    onCellClick: (columnId: ContactFieldId) => void;
  }) => {
    const isEnriching = useIsCellEnriching(contact.id, column.id);
    return (
      <td
        className={cn(
          "border-r border-border p-0",
          stickyStyle && "sticky z-10 bg-background"
        )}
        style={{
          width,
          minWidth: width,
          maxWidth: width,
          ...stickyStyle,
        }}
        onClick={() => !isEnriching && onCellClick(column.id)}
      >
        <EditableCell
          contactId={contact.id}
          value={cellValue}
          column={column}
          isEnriching={isEnriching}
        />
      </td>
    );
  }
);
ContactTableCell.displayName = "ContactTableCell";

interface ContactTableRowProps {
  contact: Contact;
  rowIndex: number;
  rowStyle?: React.CSSProperties;
  visibleColumns: ContactColumn[];
}

export const ContactTableRow = memo(
  ({ contact, rowIndex, rowStyle, visibleColumns }: ContactTableRowProps) => {
    const { isSelected, handleToggleSelection, handleCellClick } =
      useContactRowController(contact.id);
    const columnWidths = useContactsTableStore((s) => s.columnWidths);
    const pinnedColumns = useContactsTableStore((s) => s.pinnedColumns);

    // Separate columns into pinned left, unpinned, and pinned right
    const { pinnedLeft, unpinned, pinnedRight } = useMemo(() => {
      const pinnedLeft = visibleColumns.filter((c) =>
        pinnedColumns.left.includes(c.id)
      );
      const pinnedRight = visibleColumns.filter((c) =>
        pinnedColumns.right.includes(c.id)
      );
      const unpinned = visibleColumns.filter(
        (c) =>
          !pinnedColumns.left.includes(c.id) &&
          !pinnedColumns.right.includes(c.id)
      );
      return { pinnedLeft, unpinned, pinnedRight };
    }, [visibleColumns, pinnedColumns]);

    // Calculate left offset for pinned left columns
    const getLeftOffset = (index: number) => {
      const selectorWidth = 60;
      const pinnedBefore = pinnedLeft.slice(0, index);
      const totalWidth = pinnedBefore.reduce((sum, col) => {
        const width = columnWidths.get(col.id) ?? col.width ?? 120;
        return sum + width;
      }, 0);
      return selectorWidth + totalWidth;
    };

    // Calculate right offset for pinned right columns
    const getRightOffset = (index: number) => {
      const addColumnWidth = 50;
      const pinnedAfter = pinnedRight.slice(index + 1);
      const totalWidth = pinnedAfter.reduce((sum, col) => {
        const width = columnWidths.get(col.id) ?? col.width ?? 120;
        return sum + width;
      }, 0);
      return addColumnWidth + totalWidth;
    };

    return (
      <tr
        style={rowStyle}
        className={cn(
          "group border-b border-border transition-colors",
          isSelected && "bg-primary/5",
          !isSelected && "hover:bg-muted/30"
        )}
      >
        {/* Row number & checkbox */}
        <td className="sticky left-0 z-10 bg-background border-r border-border w-[60px] min-w-[60px]">
          <div className="flex items-center gap-1 px-2 py-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleToggleSelection}
              className="opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 transition-opacity"
            />
            <span
              className="text-xs text-muted-foreground w-6 text-right group-hover:hidden data-[selected=true]:hidden"
              data-selected={isSelected}
            >
              {rowIndex + 1}
            </span>
          </div>
        </td>

        {/* Pinned left cells */}
        {pinnedLeft.map((column, index) => {
          const rawValue = getContactFieldValue(contact, column.id);
          const boolValue =
            rawValue === true ||
            rawValue === "true" ||
            rawValue === 1 ||
            rawValue === "1";
          const cellValue =
            column.type === "boolean"
              ? boolValue
                ? "Yes"
                : "No"
              : String(rawValue ?? "");
          const width = columnWidths.get(column.id) ?? column.width ?? 120;
          const leftOffset = getLeftOffset(index);
          return (
            <ContactTableCell
              key={column.id}
              contact={contact}
              column={column}
              cellValue={cellValue}
              width={width}
              stickyStyle={{ left: `${leftOffset}px` }}
              onCellClick={handleCellClick}
            />
          );
        })}

        {/* Unpinned cells */}
        {unpinned.map((column) => {
          const rawValue = getContactFieldValue(contact, column.id);
          const boolValue =
            rawValue === true ||
            rawValue === "true" ||
            rawValue === 1 ||
            rawValue === "1";
          const cellValue =
            column.type === "boolean"
              ? boolValue
                ? "Yes"
                : "No"
              : String(rawValue ?? "");
          const width = columnWidths.get(column.id) ?? column.width ?? 120;
          return (
            <ContactTableCell
              key={column.id}
              contact={contact}
              column={column}
              cellValue={cellValue}
              width={width}
              onCellClick={handleCellClick}
            />
          );
        })}

        {/* Pinned right cells */}
        {pinnedRight.map((column, index) => {
          const rawValue = getContactFieldValue(contact, column.id);
          const boolValue =
            rawValue === true ||
            rawValue === "true" ||
            rawValue === 1 ||
            rawValue === "1";
          const cellValue =
            column.type === "boolean"
              ? boolValue
                ? "Yes"
                : "No"
              : String(rawValue ?? "");
          const width = columnWidths.get(column.id) ?? column.width ?? 120;
          const rightOffset = getRightOffset(index);
          return (
            <ContactTableCell
              key={column.id}
              contact={contact}
              column={column}
              cellValue={cellValue}
              width={width}
              stickyStyle={{ right: `${rightOffset}px` }}
              onCellClick={handleCellClick}
            />
          );
        })}

        {/* Add Column cell (matches header) */}
        <td className="border-r border-border w-[50px] min-w-[50px] p-0" />

        {/* Empty cell for remaining space */}
        <td className="w-full" />
      </tr>
    );
  }
);

ContactTableRow.displayName = "ContactTableRow";
