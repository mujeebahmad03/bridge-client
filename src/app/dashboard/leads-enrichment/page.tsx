import { DASHBOARD_ROUTES } from "@/config/app-route";

import { DashboardContent, MainLayout } from "@/layout/components";
import { type CrumbItem } from "@/layout/types";
import { LeadsEnrichmentPage } from "@/leads/pages";

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
    <MainLayout>
      <DashboardContent breadcrumbs={breadcrumbs} currentPage={currentPage}>
        <LeadsEnrichmentPage />
      </DashboardContent>
    </MainLayout>
  );
};

export default LeadsEnrichment;
