import { DASHBOARD_ROUTES } from "@/config/app-route";

import { DashboardContent } from "@/layout/components";
import { type CrumbItem } from "@/layout/types";
import TeamsPage from "@/teams/page";

const breadcrumbs: CrumbItem[] = [
  {
    title: "Dashboard",
    url: DASHBOARD_ROUTES.OVERVIEW,
  },
  {
    title: "Teams",
    url: DASHBOARD_ROUTES.TEAMS,
  },
];

const currentPage = "Manage Teams";

const Teams = () => {
  return (
    <DashboardContent breadcrumbs={breadcrumbs} currentPage={currentPage}>
      <TeamsPage />
    </DashboardContent>
  );
};

export default Teams;
