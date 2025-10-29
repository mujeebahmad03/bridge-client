export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  SIGN_UP: "/auth/sign-up",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_ACCOUNT: "/auth/verify-account",
} as const;

export const DASHBOARD_ROUTES = {
  OVERVIEW: "/dashboard/overview",
  PROJECTS: "/dashboard/projects",
  SETTINGS: "/dashboard/settings",
} as const;
