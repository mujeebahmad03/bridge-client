"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { InputFormField } from "@/components/form-fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { AUTH_ROUTES } from "@/config/app-route";

import { containerVariants, itemVariants } from "@/auth/config";
import {
  type ForgotPasswordFormData,
  forgotPasswordSchema,
} from "@/auth/validations";

export const ForgotPasswordForm = () => {
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    console.log(data);
    // Handle password reset logic here
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8">
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Reset your password
        </h1>
        <p className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your
          password
        </p>
      </motion.div>

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
            <Button type="submit" className="w-full h-12 text-base">
              Send reset link
            </Button>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-center text-sm text-muted-foreground"
          >
            Remember your password?{" "}
            <Link
              href={AUTH_ROUTES.LOGIN}
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </motion.p>
        </motion.form>
      </Form>
    </motion.div>
  );
};
