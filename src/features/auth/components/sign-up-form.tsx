"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, User } from "lucide-react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";

import { CheckboxFormField, InputFormField } from "@/components/form-fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import { AUTH_ROUTES } from "@/config/app-route";

import {
  OAuthButtons,
  PasswordField,
  PasswordStrengthIndicator,
} from "./shared";
import { containerVariants, itemVariants } from "@/auth/config";
import { type SignUpFormData, signUpSchema } from "@/auth/validations";

export const SignUpForm = () => {
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

  const onSubmit = (data: SignUpFormData) => {
    console.log(data);
    // Handle sign up logic here
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Create your account
        </h1>
        <p className="text-muted-foreground">
          Start your journey with Bridge today
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3 mb-6">
        <OAuthButtons />
      </motion.div>

      <motion.div variants={itemVariants} className="relative mb-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
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
            <Button type="submit" className="w-full h-12 text-base">
              Create account
            </Button>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-center text-sm text-muted-foreground"
          >
            Already have an account?{" "}
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
