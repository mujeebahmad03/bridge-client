import {
  CheckCircle2,
  Clock,
  FileCheck,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

import {
  type EnrichmentStatus,
  type EnrichmentStatusResponse,
} from "@/leads/types";

interface EnrichmentProgressProps {
  status: EnrichmentStatusResponse | null | undefined;
  isPolling: boolean;
  contactCount: number;
}

const STATUS_CONFIG: Record<
  EnrichmentStatus,
  {
    label: string;
    color: string;
    icon: React.ReactNode;
    progress: number;
  }
> = {
  PREVIEW: {
    label: "Preview",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: <FileCheck className="h-4 w-4" />,
    progress: 10,
  },
  APPROVED: {
    label: "Approved",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: <CheckCircle2 className="h-4 w-4" />,
    progress: 25,
  },
  IN_PROGRESS: {
    label: "Processing",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    progress: 60,
  },
  RESULTS_READY: {
    label: "Results Ready",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: <Sparkles className="h-4 w-4" />,
    progress: 90,
  },
  SUCCESSFUL: {
    label: "Successful",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: <CheckCircle2 className="h-4 w-4" />,
    progress: 100,
  },
  FAILED: {
    label: "Failed",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: <XCircle className="h-4 w-4" />,
    progress: 0,
  },
};

export function EnrichmentProgress({
  status,
  isPolling,
  contactCount,
}: EnrichmentProgressProps) {
  if (!status) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-8">
          <Skeleton className="h-12 w-12 rounded-full mb-4" />
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
    );
  }

  const config = STATUS_CONFIG[status.status];

  return (
    <div className="space-y-6">
      {/* Status Icon and Message */}
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div
          className={cn(
            "h-16 w-16 rounded-full flex items-center justify-center mb-4",
            status.status === "IN_PROGRESS" && "animate-pulse",
            config.color
          )}
        >
          <div className="scale-150">{config.icon}</div>
        </div>
        <Badge className={cn("mb-2", config.color)}>{config.label}</Badge>
        <p className="text-sm text-muted-foreground">
          {status.status === "IN_PROGRESS" && (
            <>
              Enriching {contactCount} contact{contactCount !== 1 ? "s" : ""}...
            </>
          )}
          {status.status === "APPROVED" && "Submitting enrichment job..."}
          {status.status === "RESULTS_READY" &&
            "Enrichment complete! Review your results."}
          {status.status === "SUCCESSFUL" &&
            "Results have been applied to contacts."}
          {status.status === "FAILED" &&
            (status.error_message ?? "An error occurred during enrichment.")}
        </p>
        {status.pipe0_job_id && (
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            Job ID: {status.pipe0_job_id}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={config.progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {status.status === "IN_PROGRESS" && isPolling && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Checking status...
              </span>
            )}
          </span>
          <span>{config.progress}%</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>Started: {new Date(status.created_at).toLocaleTimeString()}</span>
        <span>•</span>
        <span>
          Updated: {new Date(status.last_modified_at).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
