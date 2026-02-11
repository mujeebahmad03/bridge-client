import type { ImportSource } from "@/leads/types";

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
