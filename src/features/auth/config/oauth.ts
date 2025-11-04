import { env } from "@/lib/env";

export const OAUTH_PROVIDERS = {
  GOOGLE:
    `${env.NEXT_PUBLIC_GOOGLE_OAUTH_URL}` +
    `?client_id=${env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&access_type=offline`,
  LINKEDIN:
    `${env.NEXT_PUBLIC_GOOGLE_OAUTH_URL}` +
    `&client_id=${env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/linkedin` +
    `?response_type=code` +
    `&scope=openid%20profile%20email`,
  MICROSOFT:
    `${env.NEXT_PUBLIC_MICROSOFT_OAUTH_URL}` +
    `?client_id=${env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID}` +
    `&redirect_uri=${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/microsoft` +
    `&response_type=code` +
    `&response_mode=query` +
    `&scope=openid%20profile%20email%20https://graph.microsoft.com/user.read`,
} as const;
