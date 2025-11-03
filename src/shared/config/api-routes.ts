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
    GOOGLE: "users/social-auth/login/google/",
    MICROSOFT: "users/social-auth/login/microsoft/",
  },
  USERS: {
    PROFILE: "users/from-auth/",
    UPDATE_PROFILE: (id: string) => `users/${id}/`,
  },
};
