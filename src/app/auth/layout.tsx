import { type ReactNode } from "react";

import { AuthLayout } from "@/auth/components";

const AuthPageLayout = ({ children }: { children: ReactNode }) => {
  return <AuthLayout>{children}</AuthLayout>;
};

export default AuthPageLayout;
