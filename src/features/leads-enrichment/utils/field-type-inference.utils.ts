// ==================== Utility Functions ====================

import type { ValidatorType } from "@/leads/types";

/**
 * Infer validator type from field name and sample values
 */
export function inferValidatorType(
  fieldName: string,
  sampleValues: string[]
): ValidatorType {
  const nameLower = fieldName.toLowerCase();

  // Infer from field name
  if (nameLower.includes("email") || nameLower.includes("e-mail")) {
    return "EMAIL_ADDRESS";
  }
  if (
    nameLower.includes("phone") ||
    nameLower.includes("mobile") ||
    nameLower.includes("tel")
  ) {
    return "PHONE";
  }
  if (
    nameLower.includes("url") ||
    nameLower.includes("website") ||
    nameLower.includes("link")
  ) {
    return "URL";
  }
  if (
    nameLower.includes("count") ||
    nameLower.includes("amount") ||
    nameLower.includes("quantity") ||
    nameLower.includes("size") ||
    nameLower.includes("revenue") ||
    (nameLower.includes("number") && !nameLower.includes("phone"))
  ) {
    return "NUMBER";
  }

  // Infer from sample values
  const nonEmptyValues = sampleValues.filter((v) => v.trim());
  if (nonEmptyValues.length === 0) {
    return "TEXT";
  }

  // Check for email pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (nonEmptyValues.every((v) => emailPattern.test(v))) {
    return "EMAIL_ADDRESS";
  }

  // Check for URL pattern
  const urlPattern = /^https?:\/\//i;
  if (nonEmptyValues.every((v) => urlPattern.test(v))) {
    return "URL";
  }

  // Check for phone pattern (loose)
  const phonePattern = /^[\d\s\-+()]{7,}$/;
  if (nonEmptyValues.every((v) => phonePattern.test(v.replace(/\s/g, "")))) {
    return "PHONE";
  }

  // Check for number pattern
  if (nonEmptyValues.every((v) => !isNaN(parseFloat(v)))) {
    return "NUMBER";
  }

  return "TEXT";
}
