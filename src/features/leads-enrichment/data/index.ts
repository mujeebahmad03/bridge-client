import type { ImportSource, WorkflowTemplate } from "@/leads/types";

export const importSources: ImportSource[] = [
  {
    id: "csv-upload",
    name: "CSV Upload",
    description: "Upload a CSV or Excel file with your leads",
    icon: "FileSpreadsheet",
    enabled: true,
    type: "file",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Import contacts directly from your HubSpot CRM",
    icon: "Database",
    enabled: true,
    type: "integration",
  },
];

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "find-work-email",
    name: "Find Work Email",
    description:
      "Discover professional email addresses using name and company data",
    icon: "Mail",
    category: "email",
    estimatedTime: "~2 min",
    popularity: "high",
  },
  {
    id: "verify-email",
    name: "Verify Email",
    description: "Validate email deliverability and catch-all detection",
    icon: "CheckCircle",
    category: "verification",
    estimatedTime: "~1 min",
    popularity: "high",
  },
  {
    id: "find-phone",
    name: "Find Phone Number",
    description: "Locate direct dial and mobile numbers for your contacts",
    icon: "Phone",
    category: "phone",
    estimatedTime: "~3 min",
    popularity: "medium",
  },
  {
    id: "linkedin-lookup",
    name: "LinkedIn Profile Lookup",
    description: "Find and verify LinkedIn profiles for your leads",
    icon: "Linkedin",
    category: "social",
    estimatedTime: "~2 min",
    popularity: "high",
  },
  {
    id: "company-enrichment",
    name: "Company Enrichment",
    description: "Get company size, industry, revenue and more",
    icon: "Building2",
    category: "company",
    estimatedTime: "~2 min",
    popularity: "medium",
  },
  {
    id: "full-enrichment",
    name: "Full Profile Enrichment",
    description:
      "Complete enrichment with email, phone, social and company data",
    icon: "Sparkles",
    category: "email",
    estimatedTime: "~5 min",
    popularity: "high",
  },
];
