"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

import { Logo } from "@/components/common";
import { ThemeModeToggle } from "@/ui/theme-mode-toggle";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="relative flex flex-col min-h-screen lg:flex-row">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed z-50 top-6 right-6">
        <ThemeModeToggle />
      </div>
      {/* Left Panel - Brand Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex-col justify-between hidden p-12 overflow-hidden text-white lg:flex lg:w-1/2 bg-linear-to-br from-primary via-primary-glow to-primary-dark"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bg-white rounded-full top-1/4 left-1/4 w-96 h-96 blur-3xl" />
          <div className="absolute bg-white rounded-full bottom-1/4 right-1/4 w-96 h-96 blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-12"
          >
            <Logo className="size-24 text-sidebar-foreground" />
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-md"
          >
            <h1 className="mb-6 text-5xl font-bold leading-tight">
              AI-Powered Sales Platform
            </h1>
            <p className="text-lg leading-relaxed text-white/90">
              Transform your sales process with intelligent insights, automated
              workflows, and data-driven decisions.
            </p>
          </motion.div>
        </div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 flex gap-6 text-sm text-white/80"
        >
          <a href="/privacy" className="transition-colors hover:text-white">
            Privacy
          </a>
          <a href="/terms" className="transition-colors hover:text-white">
            Terms
          </a>
          <a href="/help" className="transition-colors hover:text-white">
            Help
          </a>
        </motion.div>
      </motion.div>

      {/* Right Panel - Form Section */}
      <div className="flex items-center justify-center flex-1 p-6 lg:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Logo className="size-24 text-sidebar-foreground" />
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
};
