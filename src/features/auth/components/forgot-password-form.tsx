"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { InputFormField } from "@/components/form-fields";
import { Form } from "@/components/ui/form";
import { LoadingButton } from "@/ui/loading-button";

import { AUTH_ROUTES } from "@/config/app-route";
import { useAuth, useGuestOnly } from "@/hooks/use-auth";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { ErrorResponse } from "./shared";
import { containerVariants, itemVariants } from "@/auth/config";
import {
  type ForgotPasswordFormData,
  forgotPasswordSchema,
} from "@/auth/validations";

export const ForgotPasswordForm = () => {
  useGuestOnly();
  const { forgotPassword, isSendingResetOTP, forgotPasswordError } = useAuth();
  const { setValue } = useLocalStorage<{ email: string } | null>(
    "emailForPasswordReset",
    null
  );

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data);
      setValue({ email: data.email });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8">
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="inline-flex items-center gap-2 mb-6 text-sm transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Reset your password
        </h1>
        <p className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your
          password
        </p>
      </motion.div>

      {forgotPasswordError && <ErrorResponse error={forgotPasswordError} />}

      <Form {...form}>
        <motion.form
          variants={containerVariants}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <InputFormField
              form={form}
              name="email"
              placeholder="you@company.com"
              icon={Mail}
              type="email"
              label="Email Address"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <LoadingButton
              isLoading={isSendingResetOTP}
              disabled={isSendingResetOTP}
              loadingText="Sending reset OTP..."
            >
              Send reset OTP
            </LoadingButton>
          </motion.div>

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
