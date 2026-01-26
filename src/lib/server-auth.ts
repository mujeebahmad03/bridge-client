import crypto from "crypto";
import { jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_ROUTES, DASHBOARD_ROUTES } from "@/config/app-route";

import { env } from "./env";

const TOKENS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

const rawSecret = env.NEXT_PUBLIC_JWT_SECRET;

/**
 * Get the encryption key for JWE decryption (same as TokenStorage)
 */
async function getEncryptionKey(): Promise<Uint8Array> {
  const hash = crypto.createHash("sha256").update(rawSecret).digest();
  return new Uint8Array(hash);
}

/**
 * Decrypt an encrypted JWE token (same logic as TokenStorage.decrypt)
 */
async function decryptToken(encryptedToken: string): Promise<string | null> {
  try {
    const encryptionKey = await getEncryptionKey();
    const { payload } = await jwtDecrypt(encryptedToken, encryptionKey);
    return payload.data as string;
  } catch (error) {
    // Token is invalid, expired, or decryption failed
    console.error("Error decrypting token:", error);
    return null;
  }
}

/**
 * Get the access token from cookies (server-side)
 * Returns the decrypted token or null if not found/invalid
 */
export async function getServerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const encryptedToken = cookieStore.get(TOKENS.ACCESS_TOKEN)?.value;

  if (!encryptedToken) {
    return null;
  }

  return await decryptToken(encryptedToken);
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isServerAuthenticated(): Promise<boolean> {
  const token = await getServerAccessToken();
  return !!token;
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in server layouts/pages that require auth
 */
export async function requireAuth(): Promise<void> {
  const isAuthenticated = await isServerAuthenticated();

  if (!isAuthenticated) {
    redirect(AUTH_ROUTES.LOGIN);
  }
}

/**
 * Require guest - redirects to dashboard if already authenticated
 * Use this in server layouts/pages that should only be accessible to guests
 */
export async function requireGuest(): Promise<void> {
  const isAuthenticated = await isServerAuthenticated();

  if (isAuthenticated) {
    redirect(DASHBOARD_ROUTES.OVERVIEW);
  }
}
