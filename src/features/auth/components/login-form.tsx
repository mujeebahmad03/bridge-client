"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { InputFormField } from "@/components/form-fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import { AUTH_ROUTES } from "@/config/app-route";

import { OAuthButtons, PasswordField } from "@/auth/components/shared";
import { containerVariants, itemVariants } from "@/auth/config";
import { type SignInFormData, signInSchema } from "@/auth/validations";

export const LoginForm = () => {
  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignInFormData) => {
    console.log(data);
    // Handle login logic here
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back
        </h1>
        <p className="text-muted-foreground">Sign in to your Bridge account</p>
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
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button type="submit" className="w-full h-12 text-base">
              Sign in
            </Button>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-center text-sm text-muted-foreground"
          >
            Don&apos;t have an account?{" "}
            <Link
              href={AUTH_ROUTES.LOGIN}
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </motion.p>
        </motion.form>
      </Form>
    </motion.div>
  );
};
