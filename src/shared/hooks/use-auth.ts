import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AUTH_ROUTES, DASHBOARD_ROUTES } from "@/config/app-route";

import type { ResendOTPData } from "@/auth/types";
import { authService } from "@/auth/utils/auth-service";
import type {
  ForgotPasswordFormData,
  ResetPasswordFormData,
  SignInFormData,
  SignUpFormData,
  VerifyAccountFormData,
} from "@/auth/validations";

// Query keys for type-safe cache management
export const authQueryKeys = {
  all: ["auth"] as const,
  user: () => [...authQueryKeys.all, "user"] as const,
  authenticated: () => [...authQueryKeys.all, "authenticated"] as const,
} as const;

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Query: Get current user
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: authQueryKeys.user(),
    queryFn: () => authService.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // Only fetch if we have a token
    enabled: typeof window !== "undefined",
  });

  // Query: Check authentication status
  const { data: isAuthenticated = false } = useQuery({
    queryKey: authQueryKeys.authenticated(),
    queryFn: () => authService.isAuthenticated(),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Mutation: Sign up
  const signUpMutation = useMutation({
    mutationFn: (data: SignUpFormData) => authService.signUp(data),
    onSuccess: (response) => {
      // Store email for verification step
      return response;
    },
    onError: (error: Error) => {
      console.error("Sign up error:", error);
    },
  });

  // Mutation: Verify account
  const verifyAccountMutation = useMutation({
    mutationFn: ({
      email,
      data,
    }: {
      email: string;
      data: VerifyAccountFormData;
    }) => authService.verifyAccount(email, data),
    onSuccess: async (userData) => {
      toast.success("Account verified successfully!");
      // Update auth state
      queryClient.setQueryData(authQueryKeys.user(), userData);
      queryClient.setQueryData(authQueryKeys.authenticated(), true);

      // Optionally redirect after verification
      router.push(DASHBOARD_ROUTES.OVERVIEW);
    },
    onError: (error: Error) => {
      console.error("Account verification error:", error);
    },
  });

  // Mutation: Resend OTP
  const resendOTPMutation = useMutation({
    mutationFn: (data: ResendOTPData) => authService.resendOTP(data),
    onSuccess: () => {
      toast.success("OTP resent successfully!");
    },
    onError: (error: Error) => {
      console.error("Resend OTP error:", error);
    },
  });

  // Mutation: Sign in
  const signInMutation = useMutation({
    mutationFn: (data: SignInFormData) => authService.signIn(data),
    onSuccess: async () => {
      toast.success("Signed in successfully!");
      // Update auth state
      queryClient.setQueryData(authQueryKeys.authenticated(), true);

      // Fetch user data
      const userData = await queryClient.fetchQuery({
        queryKey: authQueryKeys.user(),
        queryFn: () => authService.getCurrentUser(),
      });

      // Redirect to dashboard
      router.push(DASHBOARD_ROUTES.OVERVIEW);

      return userData;
    },
    onError: (error: Error) => {
      console.error("Sign in error:", error);
    },
  });

  // Mutation: Forgot password
  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormData) =>
      authService.forgotPassword(data),
    onError: (error: Error) => {
      console.error("Forgot password error:", error);
    },
  });

  // Mutation: Reset password
  const resetPasswordMutation = useMutation({
    mutationFn: ({
      email,
      data,
    }: {
      email: string;
      data: ResetPasswordFormData;
    }) => authService.resetPassword(email, data),
    onSuccess: () => {
      // Redirect to login after successful reset
      router.push(AUTH_ROUTES.LOGIN);
    },
    onError: (error: Error) => {
      console.error("Reset password error:", error);
    },
  });

  // Mutation: Sign out
  const signOutMutation = useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();

      // Reset auth state
      queryClient.setQueryData(authQueryKeys.user(), null);
      queryClient.setQueryData(authQueryKeys.authenticated(), false);

      // Note: Navigation is handled by authService.signOut()
    },
    onError: (error: Error) => {
      console.error("Sign out error:", error);
      // Still clear cache even on error
      queryClient.clear();
    },
  });

  return {
    // User data
    user,
    isLoadingUser,
    userError,
    isAuthenticated,
    refetchUser,

    // Sign up
    signUp: signUpMutation.mutateAsync,
    isSigningUp: signUpMutation.isPending,
    signUpError: signUpMutation.error,
    signUpData: signUpMutation.data,

    // Verify account
    verifyAccount: verifyAccountMutation.mutateAsync,
    isVerifyingAccount: verifyAccountMutation.isPending,
    verifyAccountError: verifyAccountMutation.error,

    // Resend OTP
    resendOTP: resendOTPMutation.mutateAsync,
    isResendingOTP: resendOTPMutation.isPending,
    resendOTPError: resendOTPMutation.error,

    // Sign in
    signIn: signInMutation.mutateAsync,
    isSigningIn: signInMutation.isPending,
    signInError: signInMutation.error,

    // Forgot password
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isSendingResetOTP: forgotPasswordMutation.isPending,
    forgotPasswordError: forgotPasswordMutation.error,

    // Reset password
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
    resetPasswordError: resetPasswordMutation.error,

    // Sign out
    signOut: signOutMutation.mutateAsync,
    isSigningOut: signOutMutation.isPending,
    signOutError: signOutMutation.error,
  };
}

// Utility hook for protected routes
export function useRequireAuth() {
  const { isAuthenticated, isLoadingUser } = useAuth();
  const router = useRouter();

  if (!isLoadingUser && !isAuthenticated) {
    router.push(AUTH_ROUTES.LOGIN);
  }

  return { isAuthenticated, isLoadingUser };
}

// Utility hook for guest-only routes (login, signup)
export function useGuestOnly() {
  const { isAuthenticated, isLoadingUser } = useAuth();
  const router = useRouter();

  if (!isLoadingUser && isAuthenticated) {
    router.push(DASHBOARD_ROUTES.OVERVIEW);
  }

  return { isAuthenticated, isLoadingUser };
}
