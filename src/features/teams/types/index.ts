import { type LucideIcon } from "lucide-react";

export interface Team {
  id: string;
  name: string;
  logo?: string | LucideIcon | React.ElementType;
  plan: string;
  created_by: string;
}

export interface TeamMember {
  id: string;
  role: string;
  external_id: string; // External system identifier for the member
  owner: string; // UUID of the owner or manager of this member
  email_address: string; // Member's email
  first_name: string; // Member's first name
  last_name: string; // Member's last name
  user_type: string; // Role or type (e.g., 'ADMIN', 'AGENT', 'CONTACT')
  is_active: boolean; // Whether the member is active
  is_deleted: boolean; // Whether the member is deleted
  created_at: string; // ISO 8601 timestamp for when the member was added
  last_modified_at: string; // ISO 8601 timestamp for last modification
}

export interface TeamInvitation {
  id: string;
  team: Team;
  email_address: string; // Email address of the invited user
  role: "ADMIN" | "MEMBER" | string; // Role assigned to the user
  invited_by: string; // UUID of the user who sent the invitation
}
