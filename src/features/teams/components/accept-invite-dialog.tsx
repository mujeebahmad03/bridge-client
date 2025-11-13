"use client";

import { Mail, Shield, User } from "lucide-react";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

import { type TeamInvitation } from "@/teams/types";

interface AcceptInviteDialogProps {
  invite: TeamInvitation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AcceptInviteDialog({
  invite,
  open,
  onOpenChange,
}: AcceptInviteDialogProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error("Invalid code");
      return;
    }

    setIsLoading(true);

    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Invite accepted!", {
        description: `You've successfully joined the team as ${invite.role}`,
      });
      setCode("");
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Accept Team Invite</DialogTitle>
          <DialogDescription>
            Enter the 6-digit verification code sent to your email
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{invite.email_address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Role:</span>
              <Badge
                variant={invite.role === "ADMIN" ? "default" : "secondary"}
              >
                {invite.role === "ADMIN" ? (
                  <Shield className="mr-1 h-3 w-3" />
                ) : (
                  <User className="mr-1 h-3 w-3" />
                )}
                {invite.role}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Invited by:</span>
              <span>{invite.invited_by}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => setCode(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Check your email for the verification code
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={code.length !== 6 || isLoading}>
              {isLoading ? "Verifying..." : "Accept Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
