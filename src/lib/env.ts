import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {
    NEXT_PUBLIC_JWT_SECRET: z.string().min(32),
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_API_URL: z.url(),
    NEXT_PUBLIC_GOOGLE_OAUTH_URL: z.string().min(1),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
    NEXT_PUBLIC_LINKEDIN_OAUTH_URL: z.string().min(1),
    NEXT_PUBLIC_LINKEDIN_CLIENT_ID: z.string().min(1),
    NEXT_PUBLIC_MICROSOFT_OAUTH_URL: z.string().min(1),
    NEXT_PUBLIC_MICROSOFT_CLIENT_ID: z.string().min(1),
  },

  //  For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_JWT_SECRET: process.env.NEXT_PUBLIC_JWT_SECRET,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GOOGLE_OAUTH_URL: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_LINKEDIN_OAUTH_URL: process.env.NEXT_PUBLIC_LINKEDIN_OAUTH_URL,
    NEXT_PUBLIC_LINKEDIN_CLIENT_ID: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
    NEXT_PUBLIC_MICROSOFT_OAUTH_URL:
      process.env.NEXT_PUBLIC_MICROSOFT_OAUTH_URL,
    NEXT_PUBLIC_MICROSOFT_CLIENT_ID:
      process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID,
  },
});
