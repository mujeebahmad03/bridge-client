export const API_ROUTES = {
  AUTH: {
    LOGIN: "users/auth/login/",
    SIGN_UP: "users/signup/",
    FORGOT_PASSWORD: "users/reset-password/",
    RESET_PASSWORD: "users/reset-password-complete/",
    VERIFY_ACCOUNT: "users/signup-complete/",
    RESEND_OTP: "users/resend-signup-otp/",
    REFRESH_TOKEN: "users/auth/refresh/",
    LOGOUT: "users/auth/logout/",
    SOCIAL_AUTH_LOGIN: "users/social-auth/login/",
    GOOGLE: "users/social-auth/login/google/",
    MICROSOFT: "users/social-auth/login/microsoft/",
  },
  USERS: {
    PROFILE: "users/from-auth/",
    UPDATE_PROFILE: (id: string) => `users/${id}/` as const,
  },
  TEAM: {
    GET_TEAMS: "users/teams/",
    GET_TEAM_MEMBERS: (teamId: string) => `users/teams/${teamId}/` as const,
    CREATE_TEAM: "users/teams/",
    UPDATE_TEAM: (id: string) => `users/teams/${id}/` as const,
    REMOVE_MEMBER: (teamId: string, userId: string) =>
      `users/teams/${teamId}/remove-member/${userId}/` as const,
  },
  INVITE: {
    GET_INVITES: "users/team-invites/",
    SEND_INVITE: (teamId: string) =>
      `users/teams/${teamId}/invite-users/` as const,
    RESEND_INVITE: (id: string) =>
      `users/team-invites/${id}/resend-invite/` as const,
    ACCEPT_INVITE: (id: string) =>
      `users/team-invites/${id}/accept-invite/` as const,
    REJECT_INVITE: (id: string) =>
      `users/team-invites/${id}/reject-invite/` as const,
  },
  DASHBOARD: {
    GET_CONTACT_EVENTS: "contacts/contact-events/",
    STATS: "reports/",
    BRIDGE_SUGGESTIONS: "contacts/bridge-suggestions/",
  },
  TASKS: {
    GET_TASKS: "users/tasks/",
  },
  CUSTOM_FIELDS: {
    GET_USER_CUSTOM_FIELDS: "contacts/feature-field/",
    CREATE_USER_CUSTOM_FIELD: "contacts/feature-field/",
    UPDATE_USER_CUSTOM_FIELD: (id: string) =>
      `contacts/feature-field/${id}/` as const,
    DELETE_USER_CUSTOM_FIELD: (id: string) =>
      `contacts/feature-field/${id}/` as const,
  },
  CONTACTS_IMPORT: {
    GET_IMPORT_HISTORY: "contacts/import/",
    CREATE_IMPORT: "contacts/import/",
  },
  LEADS_ENRICHMENT: {
    GET_PRESET: "contacts/enrichment/presets/",
  },
  ENRICHMENT: {
    CREATE_ENRICHMENT: "contacts/enrichment/preview/",
    APPLY_ENRICHMENT: (id: string) =>
      `contacts/enrichment/${id}/apply_results/` as const,
    GET_ENRICHMENT_RESULTS: (id: string) =>
      `contacts/enrichment/${id}/results/` as const,
    GET_ENRICHMENT_STATUS: (id: string) =>
      `contacts/enrichment/${id}/status/` as const,
    GET_ENRICHMENT_REQUESTS: "contacts/enrichment/",
  },
  CONTACTS: {
    GET_CONTACT_DATA_TABLE: "contacts/datatable/contacts-datatable/",
    GET_CONTACTS: "contacts/",
    GET_CONTACT: (id: string) => `contacts/${id}/` as const,
    CREATE_CONTACT: "contacts/",
    UPDATE_CONTACT: (id: string) => `contacts/${id}/` as const,
    DELETE_CONTACT: (id: string) => `contacts/${id}/` as const,
  },
  CONTACT_TAGS: {
    GET_CONTACT_TAGS: "contacts/tags/",
    CREATE_CONTACT_TAG: "contacts/tags/",
    GET_CONTACT_TAG: (id: string) => `contacts/tags/${id}/` as const,
    UPDATE_CONTACT_TAG: (id: string) => `contacts/tags/${id}/` as const,
    DELETE_CONTACT_TAG: (id: string) => `contacts/tags/${id}/` as const,
  },
} as const;
