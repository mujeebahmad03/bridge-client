"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { InputFormField } from "@/components/form-fields";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { LoadingButton } from "@/ui/loading-button";

import { AUTH_ROUTES } from "@/config/app-route";
import { useAuth, useGuestOnly } from "@/hooks/use-auth";

import {
  ErrorResponse,
  OAuthButtons,
  PasswordField,
} from "@/auth/components/shared";
import { containerVariants, itemVariants } from "@/auth/config";
import { type SignInFormData, signInSchema } from "@/auth/validations";

export const LoginForm = () => {
  useGuestOnly();
  const { signIn, isSigningIn, signInError } = useAuth();
  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      await signIn(data);
    } catch (e) {
      console.error(e);
    }
    // Handle login logic here
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Welcome back
        </h1>
        <p className="text-muted-foreground">Sign in to your Bridge account</p>
      </motion.div>

      {signInError && <ErrorResponse error={signInError} />}

      <motion.div variants={itemVariants} className="mb-6 space-y-3">
        <OAuthButtons />
      </motion.div>

      <motion.div variants={itemVariants} className="relative mb-6">
        <Separator />
        <span className="absolute px-2 text-xs -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 bg-background text-muted-foreground">
          Or continue with email
        </span>
      </motion.div>

      <Form {...form}>
        <motion.form
          variants={containerVariants}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
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
            <PasswordField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
            />
            <Link
              href={AUTH_ROUTES.FORGOT_PASSWORD}
              className="flex justify-end mt-2 text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <LoadingButton
              isLoading={isSigningIn}
              disabled={isSigningIn}
              loadingText="Signing in..."
            >
              Sign in
            </LoadingButton>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-sm text-center text-muted-foreground"
          >
            Don&apos;t have an account?{" "}
            <Link
              href={AUTH_ROUTES.SIGN_UP}
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </motion.p>
        </motion.form>
      </Form>
    </motion.div>
  );
};
