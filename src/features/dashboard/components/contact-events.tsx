import { DataTable } from "@/components/data-table";

import { contactEventColumns } from "@/dashboard/components/columns";
import { useContactEvents } from "@/dashboard/hooks";

export const ContactEvents = () => {
  const { contactEvents, isLoading } = useContactEvents();

  return (
    <DataTable
      columns={contactEventColumns}
      data={contactEvents}
      searchKey="contact"
      searchPlaceholder="Search events..."
      isLoading={isLoading}
      rowHeight="compact"
    />
  );
};
