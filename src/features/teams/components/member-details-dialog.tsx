import { formatDistanceToNow } from "date-fns";
import { Calendar, Mail, Shield, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { type TeamMember } from "@/teams/types";

interface MemberDetailsDialogProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberDetailsDialog({
  member,
  open,
  onOpenChange,
}: MemberDetailsDialogProps) {
  if (!member) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
          <DialogDescription>
            View detailed information about this team member
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {member.first_name} {member.last_name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {member.email_address}
              </div>
            </div>
            <Badge variant={member.is_active ? "default" : "secondary"}>
              {member.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Role</span>
              <Badge
                variant={member.user_type === "ADMIN" ? "default" : "secondary"}
              >
                {member.user_type === "ADMIN" ? (
                  <Shield className="mr-1 h-3 w-3" />
                ) : (
                  <User className="mr-1 h-3 w-3" />
                )}
                {member.user_type}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <span className="text-sm text-muted-foreground">
                {member.is_active ? "Active member" : "Deactivated"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Member ID</span>
              <span className="text-sm font-mono text-muted-foreground">
                {member.id}
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Joined {formatDistanceToNow(new Date(member.created_at))}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Last active:{" "}
              {formatDistanceToNow(new Date(member.last_modified_at))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
