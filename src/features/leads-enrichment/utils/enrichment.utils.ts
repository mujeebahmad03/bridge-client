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
