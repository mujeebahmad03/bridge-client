"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/ui/alert";

import { itemVariants } from "@/auth/config";

export const ErrorResponse = ({ error }: { error: Error }) => {
  return (
    <motion.div
      variants={itemVariants}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Alert variant="destructive">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </motion.div>
  );
};
