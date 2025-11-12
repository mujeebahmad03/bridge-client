import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Checkbox } from "@/ui/checkbox";

import { getFullName, getInitials } from "@/shared/utils";
import { type TeamMember } from "@/teams/types";

export const teamMemberColumns: ColumnDef<TeamMember>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const member = row.original;
      const fullName = getFullName(member);
      const initials = getInitials(member);

      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={undefined} alt={fullName} />
            <AvatarFallback>{initials || "?"}</AvatarFallback>
          </Avatar>
          <div className="font-medium">{fullName || "N/A"}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "email_address",
    header: "Email",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {row.original.email_address}
        </div>
      );
    },
  },
  {
    accessorKey: "user_type",
    header: "Role",
    cell: ({ row }) => {
      const userType = row.original.user_type;
      const roleColors: Record<string, string> = {
        ADMIN:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
        AGENT:
          "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        CONTACT:
          "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800",
      };
      const colorClass =
        roleColors[userType] ||
        "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800";

      return (
        <Badge variant="outline" className={colorClass}>
          {userType}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <Badge
          variant="outline"
          className={
            isActive
              ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
              : "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Joined",
    cell: ({ row }) => {
      try {
        const date = new Date(row.original.created_at);
        return (
          <div className="text-sm text-muted-foreground">
            {format(date, "MMM d, yyyy")}
          </div>
        );
      } catch {
        return (
          <div className="text-sm text-muted-foreground">
            {row.original.created_at}
          </div>
        );
      }
    },
  },
];
