import { type NextRequest, NextResponse } from "next/server";

import { API_ROUTES } from "@/config/api-routes";
import { env } from "@/lib/env";
import { TokenStorage } from "@/lib/token-manager";

import { type TokenPair } from "@/types/api";

/**
 * Google OAuth token exchange response
 */
interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

/**
 * Type guard helpers
 */
const isGoogleTokenResponse = (data: unknown): data is GoogleTokenResponse => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.access_token === "string" && typeof obj.token_type === "string"
  );
};

const isBackendAuthResponse = (data: unknown): data is TokenPair => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return typeof obj.token === "string" && typeof obj.user === "object";
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    // Exchange authorization code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
        ...(state && { state }),
      }),
    });

    const tokenData = (await tokenRes.json()) as unknown;

    if (!tokenRes.ok || !isGoogleTokenResponse(tokenData)) {
      console.error("Invalid token response:", tokenData);
      return NextResponse.json(
        { error: "Failed to retrieve Google token" },
        { status: 400 }
      );
    }

    // Send data to the backend for login/signup
    const backendRes = await fetch(
      `${env.NEXT_PUBLIC_API_URL}${API_ROUTES.AUTH.GOOGLE}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tokenData, code }),
      }
    );

    const backendData = (await backendRes.json()) as unknown;

    if (!backendRes.ok || !isBackendAuthResponse(backendData)) {
      console.error("Invalid backend response:", backendData);
      return NextResponse.json(
        { error: "Backend login failed" },
        { status: 400 }
      );
    }

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
