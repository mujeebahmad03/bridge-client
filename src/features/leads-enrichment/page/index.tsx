"use client";

import { RotateCcw, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/ui/button";

import {
  HistoryDataTable,
  ImportSourcesSection,
  WorkflowTemplatesSection,
} from "../components";

export const LeadsEnrichmentPage = () => {
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);

  return (
    <main className="container space-y-12">
      {/* Dev toggle - remove in production */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFirstTimeUser(!isFirstTimeUser)}
          className="gap-2 text-xs"
        >
          {isFirstTimeUser ? (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              Simulate Returning User
            </>
          ) : (
            <>
              <RotateCcw className="h-3.5 w-3.5" />
              Simulate First Time User
            </>
          )}
        </Button>
      </div>

      {isFirstTimeUser ? (
        <>
          {/* First time user - prominent import section */}
          <ImportSourcesSection variant="prominent" />
          <WorkflowTemplatesSection />
        </>
      ) : (
        <>
          {/* Returning user - compact import, history first */}
          <ImportSourcesSection variant="compact" />
          <HistoryDataTable />
          <WorkflowTemplatesSection />
        </>
      )}
    </main>
  );
};
