"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

import { PRESET_ICONS } from "./preset-card-icons";
import type { EnrichmentPreset, EnrichmentPresetValue } from "@/leads/types";
import { getRequiredFieldDisplayName } from "@/leads/utils/enrichment.utils";

interface PresetCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  preset: EnrichmentPreset;
}

export function PresetCard({ preset, className, ...props }: PresetCardProps) {
  const IconComponent =
    PRESET_ICONS[preset.value as EnrichmentPresetValue] ?? Sparkles;
  const hasRequiredFields =
    Array.isArray(preset.required_fields) && preset.required_fields.length > 0;

  return (
    <button
      type="button"
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-card p-4 text-left",
        "transition-[border-color,box-shadow,transform,opacity] duration-200",
        "hover:border-primary/50 hover:shadow-medium hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "touch-action-manipulation",
        className
      )}
      aria-label={`Start workflow: ${preset.label}. ${preset.description}`}
      {...props}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors">
          {React.createElement(IconComponent, {
            "aria-hidden": true,
            className: "h-4 w-4",
          })}
        </div>
        <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors min-w-0 flex-1">
          {preset.label}
        </h3>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-primary opacity-0 transition-[opacity,transform] duration-200 group-hover:opacity-100 group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>

      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 min-w-0">
        {preset.description}
      </p>

      {hasRequiredFields && (
        <div
          className="mt-2 flex items-baseline gap-1.5"
          role="group"
          aria-label="Required fields"
        >
          <span className="text-xs font-medium text-muted-foreground shrink-0">
            Requires:{" "}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {preset.required_fields
              .map((key) => getRequiredFieldDisplayName(key))
              .join(", ")}
          </span>
        </div>
      )}
    </button>
  );
}
