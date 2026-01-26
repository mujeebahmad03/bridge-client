"use client";

import { History, Upload } from "lucide-react";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  HistoryDataTable,
  ImportSourcesSection,
  UploadHistoryTable,
  WorkflowTemplatesSection,
} from "@/leads/components";

export const LeadsEnrichmentPage = () => {
  const [activeTab, setActiveTab] = useState("uploads");

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

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="animate-fade-up"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="uploads" className="gap-2">
              <Upload className="h-4 w-4" />
              Uploads
            </TabsTrigger>
            <TabsTrigger value="enrichments" className="gap-2">
              <History className="h-4 w-4" />
              Enrichments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="uploads" className="mt-0">
            <UploadHistoryTable />
          </TabsContent>

          <TabsContent value="enrichments" className="mt-0">
            <HistoryDataTable />
          </TabsContent>
        </Tabs>

        <WorkflowTemplatesSection />
      </div>
    </div>
  );
};
