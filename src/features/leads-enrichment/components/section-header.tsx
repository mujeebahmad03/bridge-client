import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
}

export function SectionHeader({
  icon: Icon,
  title,
  description,
  className,
  iconClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className={cn("h-5 w-5 text-primary", iconClassName)} />
        </div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
