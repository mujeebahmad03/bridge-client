import z from "zod";

export const addressSchema = z.object({
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

export const contactFormSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  other_names: z.string().max(100).optional(),
  acquisition_source: z.enum([
    "YOUTUBE",
    "FACEBOOK",
    "INSTAGRAM",
    "LINKEDIN",
    "TWITTER",
    "GOOGLE",
    "REFERRAL",
    "WEBSITE",
    "EMAIL",
    "OTHER",
  ]),
  email_address: z.string().email("Invalid email address"),
  primary_phone_number: z.string().max(20).optional(),
  linkedin_profile: z.string().url("Invalid URL").optional().or(z.literal("")),
  address: addressSchema.optional(),
  is_potential_lead: z.boolean().optional(),
});

export type AddressValues = z.infer<typeof addressSchema>;

export type ContactFormValues = z.infer<typeof contactFormSchema>;
