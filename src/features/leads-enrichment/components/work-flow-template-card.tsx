import {
  ArrowRight,
  Building2,
  CheckCircle,
  Clock,
  Linkedin,
  Mail,
  Phone,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

import type { WorkflowCategory, WorkflowTemplate } from "@/leads/types";

const iconMap = {
  Mail,
  CheckCircle,
  Phone,
  Linkedin,
  Building2,
  Sparkles,
} as const;

type IconName = keyof typeof iconMap;

const categoryColors: Record<WorkflowCategory, string> = {
  email: "bg-primary/10 text-primary",
  phone: "bg-success/10 text-success",
  social: "bg-accent text-accent-foreground",
  company: "bg-warning/10 text-warning",
  verification: "bg-secondary text-secondary-foreground",
};

interface WorkflowTemplateCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  template: WorkflowTemplate;
  ref?: React.Ref<HTMLButtonElement>;
}

export const WorkflowTemplateCard = ({
  template,
  className,
  ref,
  ...props
}: WorkflowTemplateCardProps) => {
  const IconComponent = iconMap[template.icon as IconName] ?? Sparkles;

  return (
    <button
      ref={ref}
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-card p-5 text-left transition-all duration-200",
        "hover:border-primary/50 hover:shadow-medium hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors",
            categoryColors[template.category]
          )}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        {template.popularity === "high" && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 text-xs"
          >
            <TrendingUp className="h-3 w-3" />
            Popular
          </Badge>
        )}
      </div>

      <h3 className="mt-4 font-semibold text-card-foreground group-hover:text-primary transition-colors">
        {template.name}
      </h3>

      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
        {template.description}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {template.estimatedTime}
        </span>

        <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-all duration-200 group-hover:opacity-100">
          Start
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
};

WorkflowTemplateCard.displayName = "WorkflowTemplateCard";
