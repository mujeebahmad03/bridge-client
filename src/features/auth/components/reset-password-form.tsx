"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LoadingButton } from "@/ui/loading-button";

import { AUTH_ROUTES } from "@/config/app-route";
import { useAuth, useGuestOnly } from "@/hooks/use-auth";
import { useLocalStorage } from "@/hooks/use-local-storage";

import {
  ErrorResponse,
  OTPFormField,
  PasswordField,
} from "@/auth/components/shared";
import { containerVariants, itemVariants } from "@/auth/config";
import {
  type ResetPasswordFormData,
  resetPasswordSchema,
} from "@/auth/validations";

export const ResetPasswordForm = () => {
  useGuestOnly();
  const { resetPassword, isResettingPassword, resetPasswordError } = useAuth();
  const { value, removeValue } = useLocalStorage<{ email: string } | null>(
    "emailForPasswordReset",
    null
  );

  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      otp: "",
    },
  });

  const otp = useWatch({
    control: form.control,
    name: "otp",
  });

  const isOtpValid = otp.length === 6;

  const handleVerifyOtp = () => {
    if (isOtpValid) {
      setIsOtpVerified(true);
    }
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword({ email: value?.email ?? "", data });
      removeValue();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          {isOtpVerified ? "Create new password" : "Verify your identity"}
        </h1>
        <p className="text-muted-foreground">
          {isOtpVerified
            ? "Enter your new password below"
            : "Enter the 6-digit code sent to your email"}
        </p>
      </motion.div>

      {resetPasswordError && <ErrorResponse error={resetPasswordError} />}

      <Form {...form}>
        <motion.form
          variants={containerVariants}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {!isOtpVerified ? (
            <>
              <motion.div variants={itemVariants}>
                <OTPFormField
                  control={form.control}
                  name="otp"
                  label="Verification code"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="button"
                  className="w-full h-12 text-base"
                  onClick={handleVerifyOtp}
                  disabled={!isOtpValid}
                >
                  Enter new password
                </Button>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-sm text-center text-muted-foreground"
              >
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                >
                  Resend
                </button>
              </motion.p>
            </>
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <PasswordField
                  control={form.control}
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <PasswordField
                  control={form.control}
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                />
              </motion.div>
              <LoadingButton
                isLoading={isResettingPassword}
                disabled={isResettingPassword}
                loadingText="Resetting password..."
              >
                Reset password
              </LoadingButton>
              <Button type="submit" className="w-full h-12 text-base" />
            </>
          )}

          <motion.p
            variants={itemVariants}
            className="text-sm text-center text-muted-foreground"
          >
            Remember your password?{" "}
            <Link
              href={AUTH_ROUTES.LOGIN}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </motion.p>
        </motion.form>
      </Form>
    </motion.div>
  );
};
