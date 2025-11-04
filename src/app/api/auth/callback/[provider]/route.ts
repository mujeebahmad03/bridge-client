import { type NextRequest, NextResponse } from "next/server";

import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api-client";
import { env } from "@/lib/env";
import { TokenStorage } from "@/lib/token-manager";

import { type TokenPair } from "@/types/api";

enum OAuthProvider {
  GOOGLE = "google",
  LINKEDIN = "linkedin",
  MICROSOFT = "microsoft",
}

export async function GET(
  req: NextRequest,
  params: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params.params;
    const oauthProvider = provider as OAuthProvider;

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    if (!state) {
      return NextResponse.json({ error: "Missing state" }, { status: 400 });
    }

    let backendData = {} as TokenPair;

    switch (oauthProvider) {
      case OAuthProvider.GOOGLE:
        backendData = (await apiClient.post<TokenPair>(
          API_ROUTES.AUTH.SOCIAL_AUTH_LOGIN,
          {
            provider: "google-oauth2",
            code,
            state,
            redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
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
            redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/linkedin`,
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
            redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/microsoft`,
          }
        )) as unknown as TokenPair;
        break;

      default:
        // This should never happen due to the earlier check
        return NextResponse.json(
          { error: "Unsupported provider" },
          { status: 400 }
        );
        break;
    }

    console.log("🚀 ~ GET ~ backendData:", backendData);
    await TokenStorage.setTokens(backendData);

    // Set JWT cookie and redirect
    const response = NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/dashboard`
    );
    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
