import React from "react";

import { SidebarInset } from "@/ui/sidebar";

import { SiteHeader } from "./site-header";
import { type DashboardContentProps } from "@/layout/types";

export const DashboardContent = ({
  children,
  breadcrumbs,
  currentPage,
}: DashboardContentProps) => {
  return (
    <SidebarInset>
      <SiteHeader breadcrumbs={breadcrumbs} currentPage={currentPage} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            {children}
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};
