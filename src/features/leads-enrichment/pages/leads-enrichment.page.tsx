"use client";

import {
  ImportSourcesSection,
  UploadHistoryTable,
  WorkflowTemplatesSection,
} from "@/leads/components";

export const LeadsEnrichmentPage = () => {
  return (
    <div className="container space-y-12">
      <>
        {/* First time user - prominent import section */}
        {/* <ImportSourcesSection variant="prominent" />
        <WorkflowTemplatesSection /> */}
      </>

      <div className="space-y-4">
        {/* Returning user - compact import, tabbed history */}
        <ImportSourcesSection variant="compact" />

        <WorkflowTemplatesSection />

        <UploadHistoryTable />
      </div>
    </div>
  );
};
