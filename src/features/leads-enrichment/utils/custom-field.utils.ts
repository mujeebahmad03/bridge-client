/**
 * Map a custom field id (UUID or `cf-{uuid}`) to its display name.
 * Custom fields may come from the datatable response (via fetchDatatableCustomFields)
 * or from useCustomFields hook (which now uses the datatable endpoint internally).
 */
export function mapCustomFieldIdToName(
  fieldId: string,
  customFields: Array<{ id: string; name: string }>
): string {
  const uuid = fieldId.startsWith("cf-") ? fieldId.slice(3) : fieldId;
  const found = customFields.find((f) => f.id === uuid || f.id === fieldId);
  return found ? found.name : fieldId;
}
