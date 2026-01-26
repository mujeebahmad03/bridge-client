"use client";

import { useCallback, useRef, useState } from "react";

import { useContactsTableStore } from "@/leads/stores";
import type { ContactColumn } from "@/leads/types";

const MIN_WIDTH = 50;
const MAX_WIDTH = 500;

export function useResizableColumnHeader(column: ContactColumn) {
  const setColumnWidth = useContactsTableStore((s) => s.setColumnWidth);
  const columnWidths = useContactsTableStore((s) => s.columnWidths);

  const width = columnWidths.get(column.id) ?? column.width ?? 120;

  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startXRef.current;
        const newWidth = Math.min(
          MAX_WIDTH,
          Math.max(MIN_WIDTH, startWidthRef.current + delta)
        );
        setColumnWidth(column.id, newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [column.id, width, setColumnWidth]
  );

  const handleResizeKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();

        const step = e.shiftKey ? 10 : 5; // Larger steps with Shift
        const delta = e.key === "ArrowRight" ? step : -step;
        const newWidth = Math.min(
          MAX_WIDTH,
          Math.max(MIN_WIDTH, width + delta)
        );
        setColumnWidth(column.id, newWidth);
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        (e.currentTarget as HTMLElement).blur();
      }
    },
    [column.id, width, setColumnWidth]
  );

  return {
    width,
    isResizing,
    handleResizeStart,
    handleResizeKeyDown,
  };
}
