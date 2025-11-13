import { Check, MoreHorizontal, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AcceptInviteDialog } from "./accept-invite-dialog";
import { type TeamInvitation } from "@/teams/types";

interface InviteActionsProps {
  invite: TeamInvitation;
}

export function InviteActions({ invite }: InviteActionsProps) {
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleReject = () => {
    toast.error("Invite rejected", {
      description: `Rejected invite for ${invite.email_address}`,
    });
    setShowRejectDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {invite.status === "PENDING" ? (
            <>
              <DropdownMenuItem onClick={() => setShowAcceptDialog(true)}>
                <Check className="mr-2 h-4 w-4" />
                Accept Invite
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowRejectDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Reject Invite
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem disabled>
              {invite.status === "ACCEPTED" ? "Accepted" : "Rejected"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AcceptInviteDialog
        invite={invite}
        open={showAcceptDialog}
        onOpenChange={setShowAcceptDialog}
      />

      <ConfirmationDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        title="Reject Invite"
        description={`Are you sure you want to reject the invite for ${invite.email_address}? This action cannot be undone.`}
        onConfirm={handleReject}
        confirmText="Reject"
        variant="destructive"
      />
    </>
  );
}
