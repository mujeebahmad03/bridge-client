export const ACQUISITION_SOURCES = [
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
] as const;

export type AcquisitionSource = (typeof ACQUISITION_SOURCES)[number];

export const ACQUISITION_SOURCE_OPTIONS: {
  value: AcquisitionSource;
  label: string;
}[] = [
  { value: "YOUTUBE", label: "YouTube" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "TWITTER", label: "Twitter" },
  { value: "GOOGLE", label: "Google" },
  { value: "REFERRAL", label: "Referral" },
  { value: "WEBSITE", label: "Website" },
  { value: "EMAIL", label: "Email" },
  { value: "OTHER", label: "Other" },
];
