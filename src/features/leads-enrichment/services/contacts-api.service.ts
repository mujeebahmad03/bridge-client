import { API_ROUTES } from "@/config/api-routes";
import { apiClient, ApiError } from "@/lib/api-client";

import { type ApiResponse } from "@/types/api";

import { createCustomField } from "./contacts-upload.service";
import {
  type Contact,
  type ContactAddress,
  type ContactColumn,
  type ContactFieldId,
  type ContactFieldValue,
  type CreateContactPayload,
  type CustomField,
  type CustomFieldId,
  DEFAULT_CONTACT_COLUMNS,
  type ValidatorType,
} from "@/leads/types";

const SYSTEM_KEYS = new Set([
  "external_id",
  "first_name",
  "last_name",
  "other_names",
  "acquisition_source",
  "email_address",
  "primary_phone_number",
  "linkedin_profile",
  "address",
]);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isCustomFieldUuid(key: string): boolean {
  return UUID_REGEX.test(key) && !SYSTEM_KEYS.has(key);
}

// ==================== API wrapper (unwrap response, handle errors) ====================

/** Type guard: payload is wrapped { status, data } ApiResponse */
function isWrappedApiResponse<T>(payload: unknown): payload is ApiResponse<T> {
  if (!payload || typeof payload !== "object") {
    return false;
  }
  const o = payload as Record<string, unknown>;
  if (!("status" in o) || !("data" in o)) {
    return false;
  }
  const s = o.status;
  if (!s || typeof s !== "object") {
    return false;
  }
  const st = s as Record<string, unknown>;
  return typeof st.status_code === "number";
}

class ContactsApiService {
  private isSuccessResponse(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300;
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    if (error instanceof ApiError) {
      if (error.fields) {
        const msg = Object.entries(error.fields)
          .map(([f, m]) => `${f}: ${m.join(", ")}`)
          .join("; ");
        throw new Error(msg || error.detail || defaultMessage);
      }
      throw new Error(error.detail || defaultMessage);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(defaultMessage);
  }

  private validateResponse<T>(
    response: ApiResponse<T>,
    defaultErrorMessage: string
  ): T {
    if (this.isSuccessResponse(response.status.status_code) && response.data) {
      return response.data;
    }
    throw new Error(defaultErrorMessage);
  }

  private unwrapResponse<T>(payload: unknown, defaultErrorMessage: string): T {
    if (isWrappedApiResponse<T>(payload)) {
      return this.validateResponse(payload, defaultErrorMessage);
    }
    return payload as T;
  }

  async fetchContacts(params?: { search?: string }): Promise<Contact[]> {
    const result = await this.fetchContactsWithCustomFields(params);
    return result.contacts;
  }

  /**
   * Fetch contacts and custom fields from the datatable endpoint in a single API call.
   * This is the primary method - other methods delegate to this to avoid duplicate requests.
   */
  async fetchContactsWithCustomFields(params?: { search?: string }): Promise<{
    contacts: Contact[];
    customFields: CustomField[];
  }> {
    try {
      const queryParams: Record<string, string | number> = {};
      if (params?.search?.trim()) {
        queryParams.search = params.search.trim();
      }
      queryParams.page_size = 10_000;

      const response = await apiClient.get<unknown>(
        API_ROUTES.CONTACTS.GET_CONTACT_DATA_TABLE,
        { params: queryParams }
      );
      const raw = this.unwrapResponse<unknown>(
        response,
        "Failed to fetch contacts"
      );
      const contactList = extractContactList(raw);
      const customFields = extractCustomFieldsFromDatatable(raw);

      return {
        contacts: contactList.map((r) => normalizeContact(r)),
        customFields,
      };
    } catch (e) {
      this.handleApiError(e, "Failed to fetch contacts");
    }
  }

  async createContact(payload: CreateContactPayload): Promise<Contact> {
    try {
      const body = toCreateContactRequest(payload);
      const response = await apiClient.post<unknown>(
        API_ROUTES.CONTACTS.CREATE_CONTACT,
        body
      );
      const raw = this.unwrapResponse<unknown>(
        response,
        "Failed to create contact"
      );
      return normalizeContact(raw as Record<string, unknown>);
    } catch (e) {
      this.handleApiError(e, "Failed to create contact");
    }
  }

  async deleteContacts(ids: string[]): Promise<void> {
    try {
      for (const id of ids) {
        await apiClient.delete(API_ROUTES.CONTACTS.DELETE_CONTACT(id));
      }
    } catch (e) {
      this.handleApiError(e, "Failed to delete contacts");
    }
  }

  async updateContactField(payload: {
    contactId: string;
    fieldId: ContactFieldId;
    value: ContactFieldValue;
  }): Promise<Contact> {
    try {
      const body = buildUpdateFieldPayload(payload.fieldId, payload.value);
      const response = await apiClient.patch<unknown>(
        API_ROUTES.CONTACTS.UPDATE_CONTACT(payload.contactId),
        body
      );
      const raw = this.unwrapResponse<unknown>(
        response,
        "Failed to update contact"
      );
      return normalizeContact(raw as Record<string, unknown>);
    } catch (e) {
      this.handleApiError(e, "Failed to update contact");
    }
  }
}

const contactsApiService = new ContactsApiService();

/** Build minimal PATCH body for a single contact field update. */
function buildUpdateFieldPayload(
  fieldId: ContactFieldId,
  value: ContactFieldValue
): Record<string, unknown> {
  if (isCustomFieldId(fieldId)) {
    const uuid = String(fieldId).startsWith("cf-")
      ? String(fieldId).slice(3)
      : String(fieldId);
    return { custom_fields: { [uuid]: value ?? null } };
  }
  const key = String(fieldId);
  if (key === "address.city") {
    return { address: { city: value ?? "" } };
  }
  if (key === "address.country") {
    return { address: { country: value ?? "" } };
  }
  return { [key]: value };
}

/**
 * Extract custom fields array from datatable response.
 * The payload is the unwrapped data object: { paginator?, custom_fields?, data? }.
 * @param payload - The unwrapped datatable response
 * @returns Array of CustomField objects
 */
function extractCustomFieldsFromDatatable(payload: unknown): CustomField[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }
  const o = payload as Record<string, unknown>;
  const customFields = o.custom_fields;
  if (!Array.isArray(customFields)) {
    return [];
  }
  return customFields.map((item) => {
    const cf = item as Record<string, unknown>;
    return {
      id: String(cf.id ?? ""),
      name: String(cf.name ?? ""),
      validator_type: (cf.validator_type ?? "TEXT") as ValidatorType,
      description: String(cf.description ?? ""),
      created_at: String(cf.created_at ?? ""),
      last_modified_at: String(cf.last_modified_at ?? ""),
    } as CustomField;
  });
}

/** Extract contact list from datatable response: { data } / { paginator, data } / { results } / array. */
function extractContactList(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload as Record<string, unknown>[];
  }
  if (!payload || typeof payload !== "object") {
    return [];
  }
  const o = payload as Record<string, unknown>;
  if ("data" in o && Array.isArray(o.data)) {
    return o.data as Record<string, unknown>[];
  }
  if ("results" in o && Array.isArray(o.results)) {
    return o.results as Record<string, unknown>[];
  }
  return [];
}

const DEFAULT_ADDRESS: ContactAddress = {
  addressLine1: "",
  addressLine2: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
};

/** Parse Python-repr address string, e.g. "{'city': 'Seattle', 'addressLine2': None}". */
function parseAddressString(s: string): ContactAddress {
  const out: ContactAddress = { ...DEFAULT_ADDRESS };
  if (!s || typeof s !== "string") {
    return out;
  }
  const strRe = /'(\w+)':\s*'([^']*)'/g;
  const noneRe = /'(\w+)':\s*None/g;
  let m: RegExpExecArray | null;
  while ((m = strRe.exec(s)) !== null) {
    const [, key, val] = m;
    if (key === "address_line_1") {
      out.addressLine1 = val;
    } else if (key === "address_line_2") {
      out.addressLine2 = val;
    } else if (key === "addressLine1") {
      out.addressLine1 = val;
    } else if (key === "addressLine2") {
      out.addressLine2 = val;
    } else if (key === "street") {
      out.street = val;
    } else if (key === "city") {
      out.city = val;
    } else if (key === "state") {
      out.state = val;
    } else if (key === "zipCode" || key === "zip_code") {
      out.zipCode = val;
    } else if (key === "country") {
      out.country = val;
    }
  }
  while ((m = noneRe.exec(s)) !== null) {
    const [, key] = m;
    if (key === "address_line_1" || key === "addressLine1") {
      out.addressLine1 = "";
    } else if (key === "address_line_2" || key === "addressLine2") {
      out.addressLine2 = "";
    } else if (key === "street") {
      out.street = "";
    } else if (key === "city") {
      out.city = "";
    } else if (key === "state") {
      out.state = "";
    } else if (key === "zipCode" || key === "zip_code") {
      out.zipCode = "";
    } else if (key === "country") {
      out.country = "";
    }
  }
  return out;
}

/**
 * Normalize backend contact to Contact type.
 * Uses `id` (backend UUID) as the primary identifier, with `external_id` as fallback.
 * Parses address strings and extracts custom fields from both top-level UUIDs and nested custom_fields object.
 */
function normalizeContact(raw: Record<string, unknown>): Contact {
  const rawAddress = raw.address;
  let address: ContactAddress;
  if (typeof rawAddress === "string") {
    address = parseAddressString(rawAddress);
  } else if (rawAddress && typeof rawAddress === "object") {
    const a = rawAddress as Record<string, unknown>;
    address = {
      addressLine1: (a.addressLine1 ?? a.address_line_1 ?? "") as string,
      addressLine2: (a.addressLine2 ?? a.address_line_2 ?? "") as string,
      street: (a.street ?? "") as string,
      city: (a.city ?? "") as string,
      state: (a.state ?? "") as string,
      zipCode: (a.zipCode ?? a.zip_code ?? "") as string,
      country: (a.country ?? "") as string,
    };
  } else {
    address = { ...DEFAULT_ADDRESS };
  }

  const custom_fields: Partial<Record<CustomFieldId, ContactFieldValue>> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (isCustomFieldUuid(k)) {
      const id = `cf-${k}` as CustomFieldId;
      custom_fields[id] = v as ContactFieldValue;
    }
  }
  const cfFromNested = raw.custom_fields as Record<string, unknown> | undefined;
  if (cfFromNested && typeof cfFromNested === "object") {
    for (const [k, v] of Object.entries(cfFromNested)) {
      const id = k.startsWith("cf-")
        ? (k as CustomFieldId)
        : (`cf-${k}` as CustomFieldId);
      custom_fields[id] = v as ContactFieldValue;
    }
  }

  const now = new Date().toISOString();
  return {
    // Use backend id (UUID) as primary identifier, fallback to external_id
    id: String(raw.id ?? raw.external_id ?? ""),
    first_name: String(raw.first_name ?? ""),
    last_name: String(raw.last_name ?? ""),
    other_names: String(raw.other_names ?? ""),
    email_address: String(raw.email_address ?? ""),
    acquisition_source: (raw.acquisition_source ??
      "WEBSITE") as Contact["acquisition_source"],
    address,
    is_potential_lead: Boolean(raw.is_potential_lead ?? true),
    created_at: String(raw.created_at ?? now),
    updated_at: String(raw.updated_at ?? now),
    ...(Object.keys(custom_fields).length ? { custom_fields } : {}),
  };
}

/** Build create-contact request body (snake_case address for typical DRF). */
function toCreateContactRequest(
  payload: CreateContactPayload
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    first_name: payload.first_name,
    last_name: payload.last_name,
    other_names: payload.other_names ?? "",
    email_address: payload.email_address,
    acquisition_source: payload.acquisition_source,
    is_potential_lead: payload.is_potential_lead ?? true,
  };
  const addr = payload.address;
  if (
    addr &&
    (addr.addressLine1 ||
      addr.addressLine2 ||
      addr.street ||
      addr.city ||
      addr.state ||
      addr.zipCode ||
      addr.country)
  ) {
    body.address = {
      address_line_1: addr.addressLine1 ?? "",
      address_line_2: addr.addressLine2 ?? "",
      street: addr.street ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      zip_code: addr.zipCode ?? "",
      country: addr.country ?? "",
    };
  }
  return body;
}

// -------------------- Columns (system + custom) --------------------

function validatorTypeToColumnType(v: ValidatorType): ContactColumn["type"] {
  switch (v) {
    case "EMAIL_ADDRESS":
      return "email";
    case "PHONE":
      return "phone";
    case "TEXT":
    case "NUMBER":
    case "URL":
    case "NONE":
    default:
      return "text";
  }
}

function customFieldToContactColumn(f: CustomField): ContactColumn {
  return {
    id: `cf-${f.id}` as CustomFieldId,
    label: f.name,
    type: validatorTypeToColumnType(f.validator_type),
    width: 160,
  };
}

/**
 * Fetch contact columns including system columns and custom fields.
 * Custom fields are extracted from the datatable response.
 */
export async function fetchContactColumns(): Promise<ContactColumn[]> {
  const { customFields } = await fetchContactsWithCustomFields();
  const custom = customFields.map(customFieldToContactColumn);
  return [...DEFAULT_CONTACT_COLUMNS, ...custom];
}

export async function createCustomContactColumn(payload: {
  label: string;
  type?: ContactColumn["type"];
}): Promise<ContactColumn> {
  const created = await createCustomField({
    name: payload.label,
    validator_type: "TEXT",
    description: "",
  });
  return customFieldToContactColumn(created);
}

// -------------------- Contacts with Custom Fields (single API call) --------------------

/**
 * Fetch contacts and custom fields from the datatable endpoint in a single API call.
 * This is the recommended method when both contacts and custom fields are needed.
 */
export async function fetchContactsWithCustomFields(params?: {
  search?: string;
}): Promise<{ contacts: Contact[]; customFields: CustomField[] }> {
  return contactsApiService.fetchContactsWithCustomFields(params);
}

// -------------------- Contacts (real API) --------------------

export async function fetchContacts(params?: {
  search?: string;
}): Promise<Contact[]> {
  return contactsApiService.fetchContacts(params);
}

export async function createContact(
  payload: CreateContactPayload
): Promise<Contact> {
  return contactsApiService.createContact(payload);
}

export async function deleteContacts(ids: string[]): Promise<void> {
  return contactsApiService.deleteContacts(ids);
}

// -------------------- Field update helpers --------------------

const getNestedValue = (
  obj: Record<string, unknown>,
  path: string
): unknown => {
  return path.split(".").reduce((acc, part) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj as unknown);
};

function isCustomFieldId(fieldId: ContactFieldId): fieldId is CustomFieldId {
  return String(fieldId).startsWith("cf-");
}

export function getContactFieldValue(
  contact: Contact,
  fieldId: ContactFieldId
): ContactFieldValue {
  if (isCustomFieldId(fieldId)) {
    return contact.custom_fields?.[fieldId] ?? "";
  }
  return getNestedValue(
    contact as unknown as Record<string, unknown>,
    String(fieldId)
  ) as ContactFieldValue;
}

export async function updateContactField(payload: {
  contactId: string;
  fieldId: ContactFieldId;
  value: ContactFieldValue;
}): Promise<Contact> {
  return contactsApiService.updateContactField(payload);
}
