import { type EnrichmentStatus } from "@/leads/types";

export const statusConfig: Record<
  EnrichmentStatus,
  { label: string; className: string }
> = {
  PREVIEW: {
    label: "Preview",
    className: "bg-muted text-muted-foreground",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-blue-500/10 text-blue-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-primary/10 text-primary animate-pulse",
  },
  RESULTS_READY: {
    label: "Results Ready",
    className: "bg-green-500/10 text-green-500",
  },
  SUCCESSFUL: {
    label: "Successful",
    className: "bg-success/10 text-success",
  },
  FAILED: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive",
  },
};
