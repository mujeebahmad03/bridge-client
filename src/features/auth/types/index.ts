export const USER_TYPE = {
  OWNER: "OWNER",
  SUB_USER: "SUB_USER",
} as const;

export type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE];

export interface SignUpResponse {
  message: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  refresh: string;
  access: string;
}

export interface BusinessProfile {
  title: string;
  business_name: string;
  business_industry: string;
  website: string;
  acquisition_source: string;
  related_links: string[];
  metadata: Record<string, unknown>;
}

export interface Team {
  name: string;
  created_by: string;
}

export interface User {
  external_id: string;
  owner?: string | null;
  email_address: string;
  first_name: string;
  last_name: string;
  user_type: UserType;
  avatar?: string | null;
  is_active: boolean;
  profile: BusinessProfile;
  teams: Team[];
  is_deleted?: boolean;
  created_at?: string;
  last_modified_at?: string;
}

export interface VerificationResponse extends LoginResponse, User {}

export interface ApiLoginPayload {
  email_address: string;
  password: string;
}

export interface ApiSignupPayload extends ApiLoginPayload {
  first_name: string;
  last_name: string;
}

export interface ApiVerifyOtpPayload {
  email_address: string;
  otp_code: string;
}

export interface ApiResetPasswordPayload extends ApiLoginPayload {
  otp_code: string;
}

export interface ResendOTPData {
  email_address: string;
}
