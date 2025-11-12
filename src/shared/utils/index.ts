import { type User } from "@/auth/types";

export const getFullName = (user?: User | null) => {
  if (!user) {
    return "Guest";
  }
  return `${user.first_name} ${user.last_name}`;
};

export const getInitials = (user?: User | null) => {
  if (!user) {
    return "G";
  }

  return `${user.first_name[0].toUpperCase()}${user.last_name[0].toUpperCase()}`;
};
