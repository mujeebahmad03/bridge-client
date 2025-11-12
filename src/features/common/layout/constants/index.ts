import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileText,
  IconFolder,
  IconHelp,
  IconList,
  IconListDetails,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { DASHBOARD_ROUTES } from "@/config/app-route";

import { type NavMainItem } from "@/layout/types";

export const NAV_MAIN: NavMainItem[] = [
  {
    title: "Dashboard",
    url: DASHBOARD_ROUTES.OVERVIEW,
    icon: IconDashboard,
  },
  {
    title: "Leads Enrichment",
    url: DASHBOARD_ROUTES.LEADS_ENRICHMENT,
    icon: IconListDetails,
  },
  {
    title: "Campaigns",
    url: DASHBOARD_ROUTES.CAMPAIGN,
    icon: IconChartBar,
  },
  {
    title: "Channels",
    url: DASHBOARD_ROUTES.CHANNELS,
    icon: IconFolder,
  },
  {
    title: "CRM",
    url: DASHBOARD_ROUTES.CRM,
    icon: IconDatabase,
  },
  {
    title: "Tasks",
    url: DASHBOARD_ROUTES.TASKS,
    icon: IconList,
  },
  {
    title: "Templates",
    url: DASHBOARD_ROUTES.TEMPLATES,
    icon: IconFileText,
  },
  {
    title: "Team",
    url: DASHBOARD_ROUTES.TEAMS,
    icon: IconUsers,
  },
];

export const NAV_SECONDARY: NavMainItem[] = [
  {
    title: "Settings",
    url: DASHBOARD_ROUTES.SETTINGS,
    icon: IconSettings,
  },
  {
    title: "Get Help",
    url: "#",
    icon: IconHelp,
  },
];
