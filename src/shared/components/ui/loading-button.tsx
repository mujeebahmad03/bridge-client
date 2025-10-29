"use client";

import { motion } from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";
import type React from "react";

import { Button, type ButtonProps } from "@/ui/button";

interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  icon?: LucideIcon;
  loadingText?: string;
}

export function LoadingButton({
  isLoading,
  disabled = false,
  children,
  icon: Icon = ArrowRight,
  className = "",
  type = "submit",
  loadingText,
  onClick,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      type={type}
      className={`group h-12 w-full ${className}`}
      disabled={isLoading || disabled}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="w-5 h-5 border-2 border-white rounded-full border-t-transparent"
        />
      ) : (
        <>
          {isLoading && loadingText ? loadingText : children}
          {!isLoading && (
            <Icon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          )}
        </>
      )}
    </Button>
  );
}
