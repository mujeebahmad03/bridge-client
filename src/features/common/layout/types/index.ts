import { type Icon } from "@tabler/icons-react";

export type NavMainItem = {
  title: string;
  url: string;
  icon: Icon;
  submenu?: NavMainItem[];
};

export interface CrumbItem extends Omit<NavMainItem, "submenu" | "icon"> {
  icon?: React.ElementType;
}

export interface SiteHeaderProps {
  breadcrumbs: CrumbItem[];
  currentPage: string;
}

export interface DashboardContentProps extends SiteHeaderProps {
  children: React.ReactNode;
}
