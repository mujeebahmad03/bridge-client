import { systemFields } from "@/leads/constants/system-fields";

/** Convert API required_fields key (snake_case) to system field id (UPPER_SNAKE) for validation. */
export function requiredFieldToSystemId(apiKey: string): string {
  return apiKey.toUpperCase();
}

/** Get human-readable label for API required_fields key (e.g. email_address → "Email Address"). */
export function getRequiredFieldDisplayName(apiKey: string): string {
  const systemId = requiredFieldToSystemId(apiKey);
  const field = systemFields.find((f) => f.id === systemId);
  if (field) {
    return field.name;
  }
  return apiKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Returns required field API keys that are not covered by the given mapped target field ids.
 * Preset required_fields are normalized to system ids for comparison; only system fields are checked.
 */
export function getMissingRequiredFields(
  requiredFields: string[],
  mappedTargetIds: string[]
): string[] {
  const mappedSet = new Set(mappedTargetIds);
  return requiredFields.filter((apiKey) => {
    const systemId = requiredFieldToSystemId(apiKey);
    return !mappedSet.has(systemId);
  });
}

// Fields to exclude from display (internal fields)
export const EXCLUDED_FIELDS = new Set([
  "Id",
  "id",
  "First Name",
  "Last Name",
  "Email Address",
]);

// Helper to extract display value from the nested structure
export function getFieldValue(
  field: { value: string } | string | undefined
): string {
  if (!field) {
    return "";
  }
  if (typeof field === "string") {
    return field;
  }
  return field.value ?? "";
}

// Helper to check if value is a URL
export function isUrl(value: string): boolean {
  if (typeof value !== "string") {
    return false;
  }
  return value.startsWith("http://") || value.startsWith("https://");
}

// Helper to format field names for display
export function formatFieldName(field: string): string {
  // Check if it's a UUID (custom field)
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      field
    );
  if (isUuid) {
    return "Custom Field";
  }
  return field.replace(/_/g, " ");
}
