import { DASHBOARD_ROUTES } from "@/config/app-route";

import { DashboardContent } from "@/layout/components";
import { type CrumbItem } from "@/layout/types";
import { LeadsEnrichmentPage } from "@/leads/page";

const breadcrumbs: CrumbItem[] = [
  {
    title: "Dashboard",
    url: DASHBOARD_ROUTES.OVERVIEW,
  },
  {
    title: "Leads Enrichment",
    url: DASHBOARD_ROUTES.LEADS_ENRICHMENT,
  },
];

const currentPage = "Leads Enrichment";

const LeadsEnrichment = () => {
  return (
    <DashboardContent breadcrumbs={breadcrumbs} currentPage={currentPage}>
      <LeadsEnrichmentPage />
    </DashboardContent>
  );
};

export default LeadsEnrichment;
