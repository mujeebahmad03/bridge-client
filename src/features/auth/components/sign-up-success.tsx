"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { LoadingButton } from "@/ui/loading-button";

import { AUTH_ROUTES } from "@/config/app-route";
import { useAuth, useGuestOnly } from "@/hooks/use-auth";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { ErrorResponse } from "./shared";
import { containerVariants, itemVariants } from "@/auth/config";

export const SignUpSuccess = () => {
  const [resent, setResent] = useState(false);
  useGuestOnly();
  const { resendOTP, isResendingOTP, resendOTPError } = useAuth();
  const { value } = useLocalStorage<{ email: string } | null>(
    "emailForVerification",
    null
  );

  const handleResend = async () => {
    try {
      await resendOTP({ email_address: value?.email ?? "" });
      setResent(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center"
    >
      <motion.div
        variants={itemVariants}
        className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary/10"
      >
        <Mail className="w-8 h-8 text-primary" />
      </motion.div>

      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Check your email
        </h1>
        <p className="text-muted-foreground">
          We&apos;ve sent a verification link to your email address. Click the
          link to verify your account and get started with Bridge.
        </p>
      </motion.div>

      {resendOTPError && <ErrorResponse error={resendOTPError} />}

      {resent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 p-4 mb-4 text-sm border rounded-lg bg-accent/50 border-primary/20 text-foreground"
        >
          <CheckCircle2 className="w-4 h-4 text-primary" />
          Verification email sent successfully!
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="space-y-4">
        <LoadingButton
          onClick={handleResend}
          isLoading={isResendingOTP}
          disabled={isResendingOTP}
          loadingText="Sending"
        >
          Resend verification email
        </LoadingButton>

        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or{" "}
          <button
            onClick={handleResend}
            disabled={isResendingOTP}
            className="font-medium text-primary hover:underline"
          >
            resend
          </button>
        </p>

        <p className="pt-4 flex flex-col gap-4 text-sm text-muted-foreground">
          <Link
            href={AUTH_ROUTES.VERIFY_ACCOUNT}
            className="font-medium text-primary hover:underline"
          >
            Verify Account
          </Link>

          <Link
            href={AUTH_ROUTES.LOGIN}
            className="font-medium text-primary hover:underline"
          >
            Back to login
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};
