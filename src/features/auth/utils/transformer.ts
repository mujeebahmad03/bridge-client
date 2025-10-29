import {
  type ApiLoginPayload,
  type ApiResetPasswordPayload,
  type ApiSignupPayload,
  type ApiVerifyOtpPayload,
} from "@/auth/types";
import {
  type ResetPasswordFormData,
  type SignInFormData,
  type SignUpFormData,
  type VerifyAccountFormData,
} from "@/auth/validations";

export function transformToLoginApiPayload(
  formData: SignInFormData
): ApiLoginPayload {
  return {
    email_address: formData.email,
    password: formData.password,
  };
}

export function transformToSignUpApiPayload(
  formData: SignUpFormData
): ApiSignupPayload {
  return {
    first_name: formData.firstName,
    last_name: formData.lastName,
    email_address: formData.email,
    password: formData.password,
  };
}

export function transformToOtpApiPayload(
  formData: VerifyAccountFormData
): ApiVerifyOtpPayload {
  return {
    email_address: formData.email,
    otp_code: formData.otp,
  };
}

export function transformToResetPasswordApiPayload(
  email: string,
  formData: ResetPasswordFormData
): ApiResetPasswordPayload {
  return {
    email_address: email,
    password: formData.password,
    otp_code: formData.otp,
  };
}
