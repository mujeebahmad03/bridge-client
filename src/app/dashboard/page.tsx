import { IconHome } from "@tabler/icons-react";

import { DASHBOARD_ROUTES } from "@/config/app-route";

import { DashboardPage } from "@/dashboard/page";
import { DashboardContent } from "@/layout/components";
import { type CrumbItem } from "@/layout/types";

const breadcrumbs: CrumbItem[] = [
  {
    title: "Home",
    url: DASHBOARD_ROUTES.OVERVIEW,
    icon: IconHome,
  },
];

export default function Page() {
  return (
    <DashboardContent breadcrumbs={breadcrumbs} currentPage="Overview">
      <DashboardPage />
    </DashboardContent>
  );
}
