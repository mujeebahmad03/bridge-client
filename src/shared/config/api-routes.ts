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
  },
  USERS: {
    PROFILE: "users/from-auth/",
    UPDATE_PROFILE: "users/update-profile/",
  },
};
