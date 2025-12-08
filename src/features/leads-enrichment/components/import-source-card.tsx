import {
  ArrowRight,
  Cloud,
  Database,
  FileSpreadsheet,
  Lock,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { ImportSource } from "@/leads/types";

const iconMap = {
  FileSpreadsheet,
  Database,
  Cloud,
  Users,
} as const;

type IconName = keyof typeof iconMap;

interface ImportSourceCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  source: ImportSource;
  variant?: "default" | "compact";
  ref?: React.Ref<HTMLButtonElement>;
}

export const ImportSourceCard = ({
  source,
  variant = "default",
  className,
  ref,
  ...props
}: ImportSourceCardProps) => {
  const IconComponent = iconMap[source.icon as IconName] ?? FileSpreadsheet;
  const isCompact = variant === "compact";

  return (
    <button
      ref={ref}
      disabled={!source.enabled}
      className={cn(
        "group relative flex items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-all duration-200",
        source.enabled &&
          "hover:border-primary/50 hover:shadow-medium cursor-pointer",
        !source.enabled && "opacity-60 cursor-not-allowed",
        isCompact ? "p-3" : "p-5",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-accent transition-colors",
          isCompact ? "h-10 w-10" : "h-12 w-12",
          source.enabled && "group-hover:bg-primary/10"
        )}
      >
        <IconComponent
          className={cn(
            "text-accent-foreground transition-colors",
            isCompact ? "h-5 w-5" : "h-6 w-6",
            source.enabled && "group-hover:text-primary"
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              "font-medium text-card-foreground",
              isCompact ? "text-sm" : "text-base"
            )}
          >
            {source.name}
          </h3>
          {!source.enabled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              Coming soon
            </span>
          )}
        </div>
        {!isCompact && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {source.description}
          </p>
        )}
      </div>

      {source.enabled && (
        <ArrowRight
          className={cn(
            "shrink-0 text-muted-foreground transition-all duration-200",
            "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
            isCompact ? "h-4 w-4" : "h-5 w-5"
          )}
        />
      )}
    </button>
  );
};

ImportSourceCard.displayName = "ImportSourceCard";
