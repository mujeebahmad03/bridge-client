import {
  ACQUISITION_SOURCE_OPTIONS,
  type AcquisitionSource,
} from "@/leads/constants";

// ==================== Address Types ====================

export interface ContactAddress {
  addressLine1: string;
  addressLine2: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// ==================== Contact Types ====================

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  other_names: string;
  email_address: string;
  primary_phone_number: string;
  linkedin_profile: string;
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
  primary_phone_number?: string;
  linkedin_profile?: string;
  address?: Partial<ContactAddress>;
  is_potential_lead?: boolean;
}

// ==================== UI Types ====================

export type Side = "left" | "right";

export type ContactStatus = "active" | "inactive" | "lead" | "customer";

export const CONTACT_STATUSES: { value: ContactStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "lead", label: "Lead" },
  { value: "customer", label: "Customer" },
];

// ==================== Column Types ====================

export type ContactColumnType =
  | "text"
  | "email"
  | "phone"
  | "select"
  | "readonly"
  | "boolean"
  | "url";

export interface ContactColumn {
  id: ContactFieldId;
  label: string;
  type: ContactColumnType;
  width?: number;
  options?: { value: string; label: string }[];
  /** Whether this column should be visible by default */
  defaultVisible?: boolean;
}

// Base shape for column definitions (avoids type cycle)
type BaseContactColumn = {
  id: string;
  label: string;
  type: ContactColumnType;
  width?: number;
  options?: { value: string; label: string }[];
  defaultVisible?: boolean;
};

/**
 * System contact columns derived from the Contact interface.
 * These are the built-in columns that every contact has.
 * Includes all system fields that can be displayed in the table.
 */
export const SYSTEM_CONTACT_COLUMNS = [
  {
    id: "first_name",
    label: "First Name",
    type: "text",
    width: 120,
    defaultVisible: true,
  },
  {
    id: "last_name",
    label: "Last Name",
    type: "text",
    width: 120,
    defaultVisible: true,
  },
  {
    id: "other_names",
    label: "Other Names",
    type: "text",
    width: 120,
    defaultVisible: true,
  },
  {
    id: "email_address",
    label: "Email",
    type: "email",
    width: 200,
    defaultVisible: true,
  },
  {
    id: "primary_phone_number",
    label: "Phone",
    type: "phone",
    width: 140,
    defaultVisible: true,
  },
  {
    id: "linkedin_profile",
    label: "LinkedIn",
    type: "url",
    width: 180,
    defaultVisible: true,
  },
  {
    id: "acquisition_source",
    label: "Source",
    type: "select",
    width: 120,
    options: ACQUISITION_SOURCE_OPTIONS,
    defaultVisible: true,
  },
  {
    id: "address.addressLine1",
    label: "Address Line 1",
    type: "text",
    width: 180,
    defaultVisible: false,
  },
  {
    id: "address.addressLine2",
    label: "Address Line 2",
    type: "text",
    width: 150,
    defaultVisible: false,
  },
  {
    id: "address.street",
    label: "Street",
    type: "text",
    width: 150,
    defaultVisible: false,
  },
  {
    id: "address.city",
    label: "City",
    type: "text",
    width: 120,
    defaultVisible: true,
  },
  {
    id: "address.state",
    label: "State",
    type: "text",
    width: 100,
    defaultVisible: false,
  },
  {
    id: "address.zipCode",
    label: "Zip Code",
    type: "text",
    width: 100,
    defaultVisible: false,
  },
  {
    id: "address.country",
    label: "Country",
    type: "text",
    width: 100,
    defaultVisible: true,
  },
  {
    id: "is_potential_lead",
    label: "Lead",
    type: "boolean",
    width: 80,
    defaultVisible: true,
  },
] as const satisfies readonly BaseContactColumn[];

/**
 * Default columns to show in the table (subset of system columns with defaultVisible: true).
 * @deprecated Use SYSTEM_CONTACT_COLUMNS with defaultVisible flag for filtering
 */
export const DEFAULT_CONTACT_COLUMNS = SYSTEM_CONTACT_COLUMNS.filter(
  (col) => col.defaultVisible
);

/** All system column IDs */
export const SYSTEM_COLUMN_IDS = SYSTEM_CONTACT_COLUMNS.map((c) => c.id);

/** Default visible column IDs */
export const DEFAULT_VISIBLE_COLUMN_IDS = SYSTEM_CONTACT_COLUMNS.filter(
  (c) => c.defaultVisible
).map((c) => c.id);

// ==================== Field Types ====================

export type ContactFieldValue = string | number | boolean | null | undefined;

export type SystemContactFieldId =
  (typeof SYSTEM_CONTACT_COLUMNS)[number]["id"];
export type CustomFieldId = `cf-${string}`;
export type ContactFieldId = SystemContactFieldId | CustomFieldId;

// ==================== Cell/Table Types ====================

export interface CellPosition {
  rowId: string;
  columnId: ContactFieldId;
}

export interface EditableCellState {
  isEditing: boolean;
  value: string;
  originalValue: string;
}

// ==================== Country Codes ====================

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
