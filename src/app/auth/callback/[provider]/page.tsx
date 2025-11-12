"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api-client";
import { env } from "@/lib/env";
import { TokenStorage } from "@/lib/token-manager";

import type { TokenPair } from "@/types/api";

enum OAuthProvider {
  GOOGLE = "google",
  LINKEDIN = "linkedin",
  MICROSOFT = "microsoft",
}

interface CallbackState {
  status: "loading" | "success" | "error";
  message: string;
  provider: string;
}

export default function OAuthCallbackPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<CallbackState>({
    status: "loading",
    message: "Authenticating...",
    provider: "",
  });

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { provider: providerParam } = await params;
        const oauthProvider = providerParam as OAuthProvider;

        setState((prev) => ({
          ...prev,
          provider: oauthProvider,
          message: `Verifying your ${oauthProvider} credentials...`,
        }));

        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code) {
          throw new Error("Missing authorization code. Please try again.");
        }

        if (!state) {
          throw new Error("Missing state parameter. Please try again.");
        }

        let backendData: TokenPair;

        switch (oauthProvider) {
          case OAuthProvider.GOOGLE:
            backendData = (await apiClient.post<TokenPair>(
              API_ROUTES.AUTH.SOCIAL_AUTH_LOGIN,
              {
                provider: "google-oauth2",
                code,
                state,
                redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/auth/callback/google`,
              }
            )) as unknown as TokenPair;
            break;
          case OAuthProvider.LINKEDIN:
            backendData = (await apiClient.post<TokenPair>(
              API_ROUTES.AUTH.SOCIAL_AUTH_LOGIN,
              {
                provider: "linkedin-openidconnect",
                code,
                state,
                redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/auth/callback/linkedin`,
              }
            )) as unknown as TokenPair;
            break;
          case OAuthProvider.MICROSOFT:
            backendData = (await apiClient.post<TokenPair>(
              API_ROUTES.AUTH.SOCIAL_AUTH_LOGIN,
              {
                provider: "microsoft-graph",
                code,
                state,
                redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/auth/callback/microsoft`,
              }
            )) as unknown as TokenPair;
            break;

          default:
            throw new Error("Unsupported OAuth provider.");
        }

        setState((prev) => ({
          ...prev,
          status: "success",
          message: "Authentication successful!",
        }));

        await TokenStorage.setTokens(backendData);

        // Redirect to dashboard after a brief moment to show success
        setTimeout(() => {
          router.push(`${env.NEXT_PUBLIC_APP_URL}/dashboard`);
        }, 1000);
      } catch (error) {
        console.error("OAuth callback error:", error);
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Authentication failed. Please try again.",
          provider: "",
        });
      }
    };

    handleCallback();
  }, [params, searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          <div className="flex flex-col items-center gap-6">
            {/* Animated loader or checkmark */}
            <div className="relative w-20 h-20">
              {state.status === "loading" && (
                <div className="animate-spin">
                  <div className="w-20 h-20 border-4 border-border rounded-full border-t-primary" />
                </div>
              )}

              {state.status === "success" && (
                <div className="w-20 h-20 flex items-center justify-center animate-pulse">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {state.status === "error" && (
                <div className="w-20 h-20 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-destructive"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Status text */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-card-foreground">
                {state.status === "loading" && "Signing in"}
                {state.status === "success" && "Success!"}
                {state.status === "error" && "Authentication Error"}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {state.message}
              </p>
            </div>

            {/* Retry button for errors */}
            {state.status === "error" && (
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Back to Login
              </button>
            )}

            {/* Loading indicator text */}
            {state.status === "loading" && (
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0s" }}
                >
                  ●
                </span>
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                >
                  ●
                </span>
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                >
                  ●
                </span>
              </div>
            )}
          </div>

          {/* Privacy note */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Securely authenticating with {state.provider || "OAuth provider"}
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
