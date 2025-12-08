import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { WorkflowTemplateCard } from "./work-flow-template-card";
import { workflowTemplates } from "@/leads/data";

interface WorkflowTemplatesSectionProps {
  className?: string;
}

export function WorkflowTemplatesSection({
  className,
}: WorkflowTemplatesSectionProps) {
  const handleTemplateClick = (templateId: string) => {
    toast.info("Please import your leads first to use this workflow");
  };

  return (
    <section className={cn("animate-fade-up", className)}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Enrichment Workflows
          </h2>
        </div>
        <p className="text-muted-foreground">
          Choose a template to enrich your leads with valuable data
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workflowTemplates.map((template, index) => (
          <WorkflowTemplateCard
            key={template.id}
            template={template}
            onClick={() => handleTemplateClick(template.id)}
            className="animate-fade-up"
            style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
          />
        ))}
      </div>
    </section>
  );
}
