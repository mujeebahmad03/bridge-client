import { env } from "@/lib/env";

export const OAUTH_PROVIDERS = {
  GOOGLE: `${env.NEXT_PUBLIC_GOOGLE_OAUTH_URL}?client_id=${env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google&response_type=code&state=12405&scope=openid`,

  MICROSOFT: `${env.NEXT_PUBLIC_MICROSOFT_OAUTH_URL}?client_id=${env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/microsoft&response_mode=query&scope=openid`,
} as const;
