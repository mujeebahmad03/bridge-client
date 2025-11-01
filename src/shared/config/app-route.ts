export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  SIGN_UP: "/auth/sign-up",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_ACCOUNT: "/auth/verify-account",
} as const;

const baseDashboardRoute = "/dashboard";

export const DASHBOARD_ROUTES = {
  OVERVIEW: baseDashboardRoute,
  LEADS_ENRICHMENT: `${baseDashboardRoute}/leads-enrichment`,
  CAMPAIGN: `${baseDashboardRoute}/campaign`,
  CHANNELS: "#",
  EMAILS: `${baseDashboardRoute}/channels/email`,
  EMAIL_MANAGEMENT: `${baseDashboardRoute}/channels/email/management`,
  EMAIL_DELIVERY_REPORT: (accountId: string) =>
    `${baseDashboardRoute}/channels/email/${accountId}/delivery-report`,
  LINKEDIN: `${baseDashboardRoute}/channels/linkedIn`,
  LINKEDIN_ACCOUNTS: `${baseDashboardRoute}/channels/linkedIn/accounts`,
  LINKEDIN_PERFORMANCE: `${baseDashboardRoute}/channels/linkedIn/performance`,
  PHONE: `${baseDashboardRoute}/channels/phone`,
  CRM: `${baseDashboardRoute}/crm`,
  CRM_IMPORT: `${baseDashboardRoute}/crm/import`,
  TASKS: `${baseDashboardRoute}/tasks`,
  TEMPLATES: `${baseDashboardRoute}/templates`,
  SETTINGS: `${baseDashboardRoute}/settings`,
} as const;
