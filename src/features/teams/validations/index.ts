import z from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1),
});

export type CreateTeamFormData = z.infer<typeof createTeamSchema>;

// Zod schema for individual invite
export const inviteSchema = z.object({
  email: z.email("Invalid email address"),
  role: z.enum(["ADMIN", "MEMBER"]),
});

// Schema for the entire invites array with duplicate checking
export const invitesArraySchema = z
  .array(inviteSchema)
  .min(1, "At least one invite is required")
  .refine(
    (invites) => {
      const emails = invites.map((inv) => inv.email.toLowerCase());
      return emails.length === new Set(emails).size;
    },
    {
      message: "Duplicate email addresses found",
    }
  );

export type InvitesArrayFormData = z.infer<typeof invitesArraySchema>;

// Wrap the array schema in an object for react-hook-form
export const inviteFormSchema = z.object({
  invites: invitesArraySchema,
});

export type InviteFormData = z.infer<typeof inviteFormSchema>;
