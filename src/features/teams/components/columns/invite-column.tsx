import { type ColumnDef } from "@tanstack/react-table";
import { differenceInDays, formatDistanceToNow } from "date-fns";
import { Shield, User } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { InviteActions } from "../invite-actions";
import { type TeamInvitation } from "@/teams/types";

export const inviteColumns: ColumnDef<TeamInvitation>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email_address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("email_address")}</div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={role === "ADMIN" ? "default" : "secondary"}>
          {role === "ADMIN" ? (
            <Shield className="mr-1 h-3 w-3" />
          ) : (
            <User className="mr-1 h-3 w-3" />
          )}
          {role}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "invited_by",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Invited By" />
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue("invited_by")}</div>
    ),
  },
  {
    accessorKey: "invited_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Invited" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("invited_at") as Date;
      return (
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(date, { addSuffix: true })}
        </div>
      );
    },
  },
  {
    accessorKey: "expiresAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expires" />
    ),
    cell: ({ row }) => {
      const expiresAt = row.getValue("expiresAt") as Date;
      const daysLeft = differenceInDays(expiresAt, new Date());
      const isExpiringSoon = daysLeft < 1;
      const isExpired = daysLeft < 0;

      return (
        <div
          className={`text-sm ${
            isExpired
              ? "text-destructive"
              : isExpiringSoon
                ? "text-orange-600 dark:text-orange-400"
                : "text-muted-foreground"
          }`}
        >
          {isExpired
            ? "Expired"
            : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "ACCEPTED"
          ? "default"
          : status === "REJECTED"
            ? "destructive"
            : "secondary";
      return <Badge variant={variant}>{status}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <InviteActions invite={row.original} />,
  },
];
