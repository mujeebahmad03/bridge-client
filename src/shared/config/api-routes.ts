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
    GET_INVITES: (teamId: string) => `users/teams/${teamId}/invites/` as const,
    SEND_INVITE: (teamId: string) =>
      `users/teams/${teamId}/invite-user/` as const,
    RESEND_INVITE: (id: string) =>
      `users/team-invites/${id}/resend-invite/` as const,
    ACCEPT_INVITE: (id: string) =>
      `users/team-invites/${id}/accept-invite/` as const,
    REJECT_INVITE: (id: string) =>
      `users/team-invites/${id}/reject-invite/` as const,
  },
  DASHBOARD: {
    GET_CONTACT_EVENTS: "contacts/contact-events/",
    GET_TASKS: "tasks/tasks/",
  },
} as const;
