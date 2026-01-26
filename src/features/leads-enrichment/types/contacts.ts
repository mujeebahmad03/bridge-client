import {
  ACQUISITION_SOURCE_OPTIONS,
  type AcquisitionSource,
} from "@/leads/constants";

export interface ContactAddress {
  addressLine1: string;
  addressLine2: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  other_names: string;
  email_address: string;
  acquisition_source: AcquisitionSource;
  address: ContactAddress;
  is_potential_lead: boolean;
  created_at: string;
  updated_at: string;
  /**
   * Persisted custom columns/fields. These are not part of the core contact schema
   * and may be created by users (e.g. via the Column Sheet).
   */
  custom_fields?: Partial<Record<CustomFieldId, ContactFieldValue>>;

  /**
   * Temporary/derived fields (e.g. enrichment preview results) may appear on Contact
   * objects. Keeping this index signature allows those flows without forcing `any`.
   */
  [key: string]: unknown;
}

export interface CreateContactPayload {
  first_name: string;
  last_name: string;
  other_names?: string;
  acquisition_source: AcquisitionSource;
  email_address: string;
  address?: Partial<ContactAddress>;
  is_potential_lead?: boolean;
}

export type Side = "left" | "right";

export type ContactStatus = "active" | "inactive" | "lead" | "customer";

export const CONTACT_STATUSES: { value: ContactStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "lead", label: "Lead" },
  { value: "customer", label: "Customer" },
];

export interface ContactColumn {
  id: ContactFieldId;
  label: string;
  type: "text" | "email" | "phone" | "select" | "readonly" | "boolean";
  width?: number;
  options?: { value: string; label: string }[];
}

// NOTE: this base shape intentionally does NOT reference `ContactFieldId`
// to avoid a type-cycle:
// ContactFieldId -> SystemContactFieldId -> typeof DEFAULT_CONTACT_COLUMNS[number]['id']
// while DEFAULT_CONTACT_COLUMNS was previously being type-checked as ContactColumn[] (which needs ContactFieldId).
type BaseContactColumn = {
  id: string;
  label: string;
  type: ContactColumn["type"];
  width?: number;
  options?: { value: string; label: string }[];
};

export const DEFAULT_CONTACT_COLUMNS = [
  { id: "first_name", label: "First Name", type: "text", width: 120 },
  { id: "last_name", label: "Last Name", type: "text", width: 120 },
  { id: "other_names", label: "Other Names", type: "text", width: 120 },
  { id: "email_address", label: "Email", type: "email", width: 200 },
  {
    id: "acquisition_source",
    label: "Source",
    type: "select",
    width: 120,
    options: ACQUISITION_SOURCE_OPTIONS,
  },
  { id: "address.city", label: "City", type: "text", width: 120 },
  { id: "address.country", label: "Country", type: "text", width: 100 },
  { id: "is_potential_lead", label: "Lead", type: "boolean", width: 80 },
] as const satisfies readonly BaseContactColumn[];

export type ContactFieldValue = string | number | boolean | null | undefined;

export type SystemContactFieldId =
  (typeof DEFAULT_CONTACT_COLUMNS)[number]["id"];
export type CustomFieldId = `cf-${string}`;
export type ContactFieldId = SystemContactFieldId | CustomFieldId;

export interface CellPosition {
  rowId: string;
  columnId: ContactFieldId;
}

export interface EditableCellState {
  isEditing: boolean;
  value: string;
  originalValue: string;
}

// Country codes for address
export const COUNTRY_CODES = [
  { value: "AF", label: "Afghanistan" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "NG", label: "Nigeria" },
  { value: "IN", label: "India" },
  { value: "CN", label: "China" },
  { value: "JP", label: "Japan" },
  { value: "BR", label: "Brazil" },
  { value: "MX", label: "Mexico" },
] as const;
