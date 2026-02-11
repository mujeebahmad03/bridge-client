import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  CheckCircle,
  Copy,
  Linkedin,
  Mail,
  Phone,
  Sparkles,
  UserCircle,
} from "lucide-react";

import type { EnrichmentPresetValue } from "@/leads/types";

export const PRESET_ICONS: Record<EnrichmentPresetValue, LucideIcon> = {
  FIND_LINKEDIN: Linkedin,
  FIND_PHONE: Phone,
  FIND_EMAIL: Mail,
  VALIDATE_EMAIL: CheckCircle,
  FIND_WORK_EMAIL: Briefcase,
  ENRICH_FROM_LINKEDIN: UserCircle,
  FULL_ENRICHMENT: Sparkles,
  COPY_COLUMN: Copy,
};
