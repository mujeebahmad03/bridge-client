import { API_ROUTES } from "@/config/api-routes";
import { AUTH_ROUTES } from "@/config/app-route";
import { apiClient } from "@/lib/api-client";
import { TokenStorage } from "@/lib/token-manager";

import { type ApiResponse } from "@/types/api";

import {
  type LoginResponse,
  type ResendOTPData,
  type SignUpResponse,
  type User,
  type VerificationResponse,
} from "@/auth/types";
import {
  transformToLoginApiPayload,
  transformToOtpApiPayload,
  transformToResetPasswordApiPayload,
  transformToSignUpApiPayload,
} from "@/auth/utils/transformer";
import {
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
  type SignInFormData,
  type SignUpFormData,
  type VerifyAccountFormData,
} from "@/auth/validations";

class AuthService {
  /**
   * Centralized method to check if response is successful
   */
  private isSuccessResponse(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300;
  }

  /**
   * Centralized error handler that extracts error message from response
   */
  private handleError<T>(
    response: ApiResponse<T>,
    defaultMessage: string
  ): never {
    const detail = response.status?.detail;
    const errorMessage =
      typeof detail === "object" ? detail.detail : detail || defaultMessage;
    throw new Error(errorMessage);
  }

  /**
   * Validates response and returns data or throws error
   */
  private validateResponse<T>(
    response: ApiResponse<T>,
    defaultErrorMessage: string
  ): T {
    if (this.isSuccessResponse(response.status.status_code) && response.data) {
      return response.data;
    }
    this.handleError(response, defaultErrorMessage);
  }

  /**
   * Store authentication tokens
   */
  private async storeTokens(data: LoginResponse): Promise<void> {
    await TokenStorage.setTokens({
      access: data.access,
      refresh: data.refresh,
    });
  }

  /**
   * Extract user data without tokens
   */
  private extractUserData(userData: User): User {
    return {
      external_id: userData.external_id,
      email_address: userData.email_address,
      first_name: userData.first_name,
      last_name: userData.last_name,
      user_type: userData.user_type,
      is_active: userData.is_active,
      profile: userData.profile,
      teams: userData.teams,
    };
  }

  /**
   * Sign up a new user
   * Returns a message indicating OTP was sent to email
   */
  async signUp(data: SignUpFormData): Promise<SignUpResponse> {
    const transformedData = transformToSignUpApiPayload(data);

    const response = await apiClient.post<string>(
      API_ROUTES.AUTH.SIGN_UP,
      transformedData
    );

    if (this.isSuccessResponse(response.status.status_code)) {
      // Extract email from response message or use provided email
      const emailMatch = response.data?.match(
        /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/
      );
      const email = emailMatch ? emailMatch[0] : data.email;

      return {
        message: response.data ?? "OTP sent successfully",
        email,
      };
    }

    this.handleError(response, "Signup failed");
  }

  /**
   * Verify account with OTP
   * Automatically stores tokens and returns user data
   */
  async verifyAccount(
    email: string,
    data: VerifyAccountFormData
  ): Promise<User> {
    const transformedData = transformToOtpApiPayload(email, data);

    const response = await apiClient.post<VerificationResponse>(
      API_ROUTES.AUTH.VERIFY_ACCOUNT,
      transformedData
    );

    const userData = this.validateResponse<VerificationResponse>(
      response,
      "Account verification failed"
    );

    await this.storeTokens(userData);
    return this.extractUserData(userData);
  }

  /**
   * Resend OTP to user's email
   */
  async resendOTP(data: ResendOTPData): Promise<string> {
    const response = await apiClient.post<string>(
      API_ROUTES.AUTH.RESEND_OTP,
      data
    );

    if (this.isSuccessResponse(response.status.status_code)) {
      return response.data ?? "OTP resent successfully";
    }

    this.handleError(response, "Failed to resend OTP");
  }

  /**
   * Sign in an existing user
   * Automatically stores tokens and returns user data
   */
  async signIn(data: SignInFormData): Promise<void> {
    const transformedData = transformToLoginApiPayload(data);
    const response = await apiClient.post<LoginResponse>(
      API_ROUTES.AUTH.LOGIN,
      transformedData
    );

    const loginData = this.validateResponse<LoginResponse>(
      response,
      "Sign in failed"
    );

    await this.storeTokens(loginData);
  }

  /**
   * Request password reset
   * Sends OTP to user's email
   */
  async forgotPassword(data: ForgotPasswordFormData): Promise<string> {
    const response = await apiClient.post<string>(
      API_ROUTES.AUTH.FORGOT_PASSWORD,
      { email_address: data.email }
    );

    if (this.isSuccessResponse(response.status.status_code)) {
      return response.data ?? "Password reset OTP sent successfully";
    }

    this.handleError(response, "Failed to send reset OTP");
  }

  /**
   * Complete password reset with OTP
   */
  async resetPassword(
    email: string,
    data: ResetPasswordFormData
  ): Promise<string> {
    const transformData = transformToResetPasswordApiPayload(email, data);
    const response = await apiClient.post<string>(
      API_ROUTES.AUTH.RESET_PASSWORD,
      transformData
    );

    if (this.isSuccessResponse(response.status.status_code)) {
      return response.data ?? "Password reset successful";
    }

    this.handleError(response, "Password reset failed");
  }

  /**
   * Sign out the current user
   * Clears tokens from storage
   */
  async signOut(): Promise<void> {
    try {
      await apiClient.post(API_ROUTES.AUTH.LOGOUT);
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      TokenStorage.clearTokens();

      if (typeof window !== "undefined") {
        window.location.href = AUTH_ROUTES.LOGIN;
      }
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(API_ROUTES.USERS.PROFILE);

    const userData = this.validateResponse<User>(
      response,
      "Failed to fetch current user"
    );

    return this.extractUserData(userData);
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await TokenStorage.getAccessToken();
    return !!token;
  }

  /**
   * Get current access token
   */
  async getAccessToken(): Promise<string | null> {
    return TokenStorage.getAccessToken();
  }

  /**
   * Get current refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return TokenStorage.getRefreshToken();
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing
export { AuthService };
