"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { AUTH_ROUTES } from "@/config/app-route";

import { containerVariants, itemVariants } from "../config";
import {
  type ResetPasswordFormData,
  resetPasswordSchema,
} from "../validations";
import { PasswordField } from "./shared";

export const ResetPasswordForm = () => {
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    console.log(data);
    // Handle password reset logic here
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Create new password
        </h1>
        <p className="text-muted-foreground">Enter your new password below</p>
      </motion.div>

      <Form {...form}>
        <motion.form
          variants={containerVariants}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
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
              label="Password"
              placeholder="Re-enter your password"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button type="submit" className="w-full h-12 text-base">
              Reset password
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
