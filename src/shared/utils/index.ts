import { type User } from "@/auth/types";
import { type TeamMember } from "@/teams/types";

export const getFullName = (user?: User | TeamMember | null) => {
  if (!user) {
    return "Guest";
  }
  return `${user.first_name} ${user.last_name}`.trim();
};

export const getInitials = (user?: User | TeamMember | null) => {
  if (!user) {
    return "G";
  }

  const first = user.first_name?.[0]?.toUpperCase() ?? "";
  const last = user.last_name?.[0]?.toUpperCase() ?? "";

  return first && last ? `${first}${last}` : first || last || "G";
};
