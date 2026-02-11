import {
  Briefcase,
  CheckCircle,
  Copy,
  Linkedin,
  Mail,
  Phone,
  Sparkles,
  UserCircle,
  Wand2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

import {
  type EnrichmentPreset,
  type EnrichmentPresetValue,
} from "@/leads/types";

interface PresetSelectorProps {
  presets: EnrichmentPreset[];
  isLoading: boolean;
  selectedContactCount: number;
  // Controlled props
  selectedPreset: EnrichmentPresetValue | null;
  onSelectPreset: (preset: EnrichmentPresetValue | null) => void;
  customDescription: string;
  onCustomDescriptionChange: (value: string) => void;
  activeTab: "preset" | "custom";
  onActiveTabChange: (tab: "preset" | "custom") => void;
  disabled?: boolean;
}

const PRESET_ICONS: Record<EnrichmentPresetValue, React.ReactNode> = {
  FIND_LINKEDIN: <Linkedin className="h-5 w-5" />,
  FIND_PHONE: <Phone className="h-5 w-5" />,
  FIND_EMAIL: <Mail className="h-5 w-5" />,
  VALIDATE_EMAIL: <CheckCircle className="h-5 w-5" />,
  FIND_WORK_EMAIL: <Briefcase className="h-5 w-5" />,
  ENRICH_FROM_LINKEDIN: <UserCircle className="h-5 w-5" />,
  FULL_ENRICHMENT: <Sparkles className="h-5 w-5" />,
  COPY_COLUMN: <Copy className="h-5 w-5" />,
};

const PRESET_COLORS: Record<EnrichmentPresetValue, string> = {
  FIND_LINKEDIN:
    "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
  FIND_PHONE:
    "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",
  FIND_EMAIL:
    "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20",
  VALIDATE_EMAIL:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
  FIND_WORK_EMAIL:
    "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20",
  ENRICH_FROM_LINKEDIN:
    "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 hover:bg-cyan-500/20",
  FULL_ENRICHMENT:
    "bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-500/20 hover:from-purple-500/20 hover:to-pink-500/20",
  COPY_COLUMN: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
};

export function PresetSelector({
  presets,
  isLoading,
  selectedContactCount,
  selectedPreset,
  onSelectPreset,
  customDescription,
  onCustomDescriptionChange,
  activeTab,
  onActiveTabChange,
  disabled,
}: PresetSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary" className="font-normal">
          {selectedContactCount} contact{selectedContactCount !== 1 ? "s" : ""}{" "}
          selected
        </Badge>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => onActiveTabChange(v as "preset" | "custom")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preset" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Preset Actions
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Custom (AI)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preset" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => onSelectPreset(preset.value)}
                disabled={disabled}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border transition-all text-left",
                  PRESET_COLORS[preset.value],
                  selectedPreset === preset.value &&
                    "ring-2 ring-primary ring-offset-2",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {PRESET_ICONS[preset.value]}
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-sm">{preset.label}</div>
                  <div className="text-xs opacity-80">{preset.description}</div>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-4 space-y-4">
          <div className="rounded-lg border border-dashed p-4 bg-muted/30">
            <div className="flex items-start gap-3 mb-3">
              <Wand2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">
                  Describe your enrichment
                </h4>
                <p className="text-xs text-muted-foreground">
                  Use natural language to describe what data you want to find
                </p>
              </div>
            </div>
            <Textarea
              placeholder="e.g., Find their LinkedIn profile, validate their email address, and get their current job title and company..."
              value={customDescription}
              onChange={(e) => onCustomDescriptionChange(e.target.value)}
              disabled={disabled}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end mt-2">
              <span className="text-xs text-muted-foreground">
                {customDescription.length} characters
              </span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
