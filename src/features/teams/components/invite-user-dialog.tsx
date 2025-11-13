import { Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { teamRoles } from "@/onboarding/constants";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InviteEntry {
  email: string;
  role: "ADMIN" | "MEMBER";
}

export function InviteUserDialog({
  open,
  onOpenChange,
}: InviteUserDialogProps) {
  const [invites, setInvites] = useState<InviteEntry[]>([
    { email: "", role: "MEMBER" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addInviteRow = () => {
    setInvites([...invites, { email: "", role: "MEMBER" }]);
  };

  const removeInviteRow = (index: number) => {
    if (invites.length > 1) {
      setInvites(invites.filter((_, i) => i !== index));
    }
  };

  const updateInvite = (
    index: number,
    field: keyof InviteEntry,
    value: string
  ) => {
    const newInvites = [...invites];
    newInvites[index] = { ...newInvites[index], [field]: value };
    setInvites(newInvites);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validInvites = invites.filter((inv) => inv.email.trim() !== "");

    if (validInvites.length === 0) {
      toast.error("No invites to send", {
        description: "Please enter at least one email address",
      });
      return;
    }

    setIsLoading(true);

    // Simulate sending invites
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Invites sent!", {
        description: `Successfully sent ${validInvites.length} invite${
          validInvites.length !== 1 ? "s" : ""
        }`,
      });
      setInvites([{ email: "", role: "MEMBER" }]);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
          <DialogDescription>
            Send invitations to new team members via email
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-3">
            {invites.map((invite, index) => (
              <div key={invite.email} className="flex items-center gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`email-${index}`}>
                    Email {invites.length > 1 && `#${index + 1}`}
                  </Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    placeholder="colleague@example.com"
                    value={invite.email}
                    onChange={(e) =>
                      updateInvite(index, "email", e.target.value)
                    }
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label htmlFor={`role-${index}`}>Role</Label>
                  <Select
                    value={invite.role}
                    onValueChange={(value) =>
                      updateInvite(index, "role", value as "ADMIN" | "MEMBER")
                    }
                  >
                    <SelectTrigger id={`role-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {teamRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {invites.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInviteRow(index)}
                    className="mb-0.5"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addInviteRow}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Invite
          </Button>

          {invites.filter((inv) => inv.email).length > 0 && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-sm font-medium mb-2">
                Ready to send {invites.filter((inv) => inv.email).length} invite
                {invites.filter((inv) => inv.email).length !== 1 ? "s" : ""}:
              </p>
              <div className="flex flex-wrap gap-2">
                {invites
                  .filter((inv) => inv.email)
                  .map((inv) => (
                    <Badge key={inv.email} variant="secondary">
                      {inv.email} - {inv.role}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Invites"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
