"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, User } from "lucide-react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";

import { CheckboxFormField, InputFormField } from "@/components/form-fields";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { LoadingButton } from "@/ui/loading-button";

import { AUTH_ROUTES } from "@/config/app-route";
import { useAuth, useGuestOnly } from "@/hooks/use-auth";
import { useLocalStorage } from "@/hooks/use-local-storage";

import {
  ErrorResponse,
  OAuthButtons,
  PasswordField,
  PasswordStrengthIndicator,
} from "./shared";
import { containerVariants, itemVariants } from "@/auth/config";
import { type SignUpFormData, signUpSchema } from "@/auth/validations";

export const SignUpForm = () => {
  useGuestOnly();
  const { signUp, isSigningUp, signUpError } = useAuth();

  const { setValue } = useLocalStorage<{ email: string } | null>(
    "emailForVerification",
    null
  );

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const password = useWatch({
    control: form.control,
    name: "password",
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await signUp(data);
      setValue({ email: data.email });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Create your account
        </h1>
        <p className="text-muted-foreground">
          Start your journey with Bridge today
        </p>
      </motion.div>

      {signUpError && <ErrorResponse error={signUpError} />}

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
              name="firstName"
              placeholder="First name"
              label="First Name"
              icon={User}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <InputFormField
              form={form}
              name="lastName"
              placeholder="Last name"
              label="Last Name"
              icon={User}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <InputFormField
              form={form}
              name="email"
              placeholder="Email"
              icon={Mail}
              type="email"
              label="Email Address"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            {/* Password Field */}
            <div className="space-y-2">
              <PasswordField
                control={form.control}
                name="password"
                label="Password"
                placeholder="Create a password"
              />
              <PasswordStrengthIndicator password={password ?? ""} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            {/* Confirm Password Field */}
            <PasswordField
              control={form.control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your password"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            <CheckboxFormField
              form={form}
              name="acceptTerms"
              label={
                <>
                  I agree to the{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </>
              }
            />

            <CheckboxFormField
              form={form}
              name="marketingEmails"
              label="I'd like to receive marketing emails about Bridge
                      updates and features"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <LoadingButton
              isLoading={isSigningUp}
              disabled={isSigningUp}
              loadingText="Creating Account..."
            >
              Create account
            </LoadingButton>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-sm text-center text-muted-foreground"
          >
            Already have an account?{" "}
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
