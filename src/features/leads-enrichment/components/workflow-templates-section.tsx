"use client";

import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { SectionHeader } from "./section-header";
import { WorkflowTemplateCard } from "./workflow-template-card";
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
      <SectionHeader
        icon={Sparkles}
        title="Enrichment Workflows"
        description="Choose a template to enrich your leads with valuable data"
      />

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
