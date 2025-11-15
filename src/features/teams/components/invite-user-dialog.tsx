"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { InputFormField } from "@/components/form-fields";
import { SelectFormField } from "@/components/form-fields/select-form-fiel";
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
import { Form } from "@/components/ui/form";

import { teamRoles } from "@/onboarding/constants";
import { useInviteUser } from "@/teams/hooks";
import { type InviteFormData, inviteFormSchema } from "@/teams/validations";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteUserDialog({
  open,
  onOpenChange,
}: InviteUserDialogProps) {
  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      invites: [{ email: "", role: "SUBUSER" }],
    },
  });

  const { inviteUser, isInvitingUser } = useInviteUser();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "invites",
  });

  const addInviteRow = () => {
    append({ email: "", role: "SUBUSER" });
  };

  const removeInviteRow = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleSubmit = async (values: InviteFormData) => {
    try {
      await inviteUser(values);
      toast.success("Invites sent!", {
        description: `Successfully sent ${values.invites.length} invite${
          values.invites.length !== 1 ? "s" : ""
        }`,
      });

      form.reset({
        invites: [{ email: "", role: "SUBUSER" }],
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isInvitingUser) {
      onOpenChange(newOpen);
      if (!newOpen) {
        form.reset({
          invites: [{ email: "", role: "SUBUSER" }],
        });
      }
    }
  };

  const watchedInvites = useWatch({
    control: form.control,
    name: "invites",
  });
  const validInvites = watchedInvites.filter((inv) => inv.email.trim() !== "");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
          <DialogDescription>
            Send invitations to new team members via email
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <InputFormField
                      form={form}
                      name={`invites.${index}.email`}
                      type="email"
                      label="Email"
                      placeholder="colleague@example.com"
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <SelectFormField
                      control={form.control}
                      label="Role"
                      name={`invites.${index}.role`}
                      options={teamRoles.map((role) => ({
                        label: role,
                        value: role,
                      }))}
                      getLabel={(role) => role.label}
                      getValue={(role) => role.value}
                    />
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInviteRow(index)}
                      className="mt-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Display root-level validation errors (e.g., duplicates) */}
            {form.formState.errors.invites &&
              (form.formState.errors.invites.message ??
                form.formState.errors.invites.root?.message) && (
                <div className="text-sm text-destructive">
                  {form.formState.errors.invites.message ??
                    form.formState.errors.invites.root?.message}
                </div>
              )}

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

            {validInvites.length > 0 && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-sm font-medium mb-2">
                  Ready to send {validInvites.length} invite
                  {validInvites.length !== 1 ? "s" : ""}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {validInvites.map((inv) => (
                    <Badge key={`${inv.email}-${inv.role}`} variant="secondary">
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
                onClick={() => handleOpenChange(false)}
                disabled={isInvitingUser}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isInvitingUser}>
                {isInvitingUser ? "Sending..." : "Send Invites"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
