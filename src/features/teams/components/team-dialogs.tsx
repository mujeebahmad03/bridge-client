import { ConfirmationDialog } from "@/components/common";

import { getFullName } from "@/shared/utils";
import { InviteUserDialog, MemberDetailsDialog } from "@/teams/components";
import { type TeamMember } from "@/teams/types";

interface TeamDialogsProps {
  dialogType: "invite" | "details" | "remove" | "toggle" | null;
  dialogData?: TeamMember;
  onClose: () => void;
  onConfirmRemove: () => void;
  onConfirmToggle: () => void;
}

export const TeamDialogs = ({
  dialogType,
  dialogData,
  onClose,
  onConfirmRemove,
  onConfirmToggle,
}: TeamDialogsProps) => {
  return (
    <>
      <MemberDetailsDialog
        member={dialogData ?? null}
        open={dialogType === "details"}
        onOpenChange={(open) => !open && onClose()}
      />

      <InviteUserDialog
        open={dialogType === "invite"}
        onOpenChange={(open) => !open && onClose()}
      />

      <ConfirmationDialog
        open={dialogType === "remove"}
        onOpenChange={(open) => !open && onClose()}
        title="Remove Member"
        description={`Are you sure you want to remove ${getFullName(dialogData)}? This action cannot be undone.`}
        onConfirm={onConfirmRemove}
        confirmText="Remove"
        variant="destructive"
      />

      <ConfirmationDialog
        open={dialogType === "toggle"}
        onOpenChange={(open) => !open && onClose()}
        title={dialogData?.is_active ? "Deactivate Member" : "Activate Member"}
        description={`Are you sure you want to ${
          dialogData?.is_active ? "deactivate" : "activate"
        } ${getFullName(dialogData)}?`}
        onConfirm={onConfirmToggle}
        confirmText={dialogData?.is_active ? "Deactivate" : "Activate"}
      />
    </>
  );
};
