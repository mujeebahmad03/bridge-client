"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { PiMicrosoftOutlookLogoFill } from "react-icons/pi";

import { Button } from "@/components/ui/button";

import { OAUTH_PROVIDERS } from "@/auth/config";

interface OAuthButtonsProps {
  isLoading?: boolean;
  delay?: number;
}

const oauthProviders = [
  {
    name: "Google",
    icon: FcGoogle,
    color: "text-red-500",
    bg: "hover:bg-red-50 dark:hover:bg-red-950/20",
    link: OAUTH_PROVIDERS.GOOGLE,
  },
  {
    name: "Microsoft",
    icon: PiMicrosoftOutlookLogoFill,
    color: "text-blue-600",
    bg: "hover:bg-blue-50 dark:hover:bg-blue-950/20",
    link: OAUTH_PROVIDERS.MICROSOFT,
  },
];

export function OAuthButtons({
  isLoading: externalLoading,
  delay = 0.2,
}: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const isLoading = loadingProvider !== null || externalLoading;

  const handleRedirect = (link: string, provider: string) => {
    if (isLoading) {
      return;
    }
    setLoadingProvider(provider);
    window.location.assign(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-3"
    >
      {oauthProviders.map((provider, index) => {
        const Icon = provider.icon;
        const loading = loadingProvider === provider.name;

        return (
          <motion.div
            key={provider.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: delay + 0.1 + index * 0.1 }}
          >
            <Button
              variant="outline"
              className={`h-12 w-full ${provider.bg} group transition-all duration-200 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => handleRedirect(provider.link, provider.name)}
              disabled={isLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin text-gray-500" />
                  Redirecting to {provider.name}...
                </>
              ) : (
                <>
                  <Icon
                    className={`mr-3 h-5 w-5 ${provider.color} transition-transform group-hover:scale-110`}
                  />
                  Continue with {provider.name}
                </>
              )}
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
