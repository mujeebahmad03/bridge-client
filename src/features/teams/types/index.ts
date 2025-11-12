import { type LucideIcon } from "lucide-react";

export interface Team {
  id: string;
  name: string;
  logo?: string | LucideIcon | React.ElementType;
  plan: string;
  created_by: string;
}
