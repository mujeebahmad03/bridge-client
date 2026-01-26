import React from "react";

import { MainLayout } from "@/layout/components";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <MainLayout>{children}</MainLayout>;
};

export default DashboardLayout;
