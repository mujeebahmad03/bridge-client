"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";

import { Form } from "@/ui/form";
import { LoadingButton } from "@/ui/loading-button";

import { useAuth, useGuestOnly } from "@/hooks/use-auth";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { ErrorResponse, OTPFormField } from "@/auth/components/shared";
import { containerVariants, itemVariants } from "@/auth/config";
import {
  type VerifyAccountFormData,
  verifyAccountSchema,
} from "@/auth/validations";

export const VerifyAccountForm = () => {
  useGuestOnly();
  const { verifyAccount, isVerifyingAccount, verifyAccountError } = useAuth();
  const { value } = useLocalStorage<{ email: string } | null>(
    "emailForVerification",
    null
  );

  const form = useForm<VerifyAccountFormData>({
    resolver: zodResolver(verifyAccountSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: VerifyAccountFormData) => {
    try {
      await verifyAccount({ email: value?.email ?? "", data });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Verify your identity
        </h1>
        <p className="text-muted-foreground">
          Enter the 6-digit code sent to your email
        </p>
      </motion.div>

      {verifyAccountError && <ErrorResponse error={verifyAccountError} />}

      <Form {...form}>
        <motion.form
          variants={containerVariants}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <motion.div variants={itemVariants}>
            <OTPFormField
              control={form.control}
              name="otp"
              label="Verification code"
            />
          </motion.div>

          <LoadingButton
            isLoading={isVerifyingAccount}
            disabled={isVerifyingAccount}
            loadingText="Verifying Account..."
          >
            Verify Account
          </LoadingButton>
        </motion.form>
      </Form>
    </motion.div>
  );
};
