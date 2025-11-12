import z from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1),
});

export type CreateTeamFormData = z.infer<typeof createTeamSchema>;
