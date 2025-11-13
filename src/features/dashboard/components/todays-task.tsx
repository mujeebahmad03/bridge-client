"use client";

import { DataTable } from "@/components/data-table/data-table";

import { taskColumns } from "./columns";
import { useTasks } from "@/tasks/hooks";

export const TodaysTask = () => {
  const { tasks, isLoading } = useTasks();

  return (
    <DataTable
      columns={taskColumns}
      data={tasks}
      searchKey="title"
      searchPlaceholder="Search todays tasks..."
      isLoading={isLoading}
      rowHeight="compact"
    />
  );
};
