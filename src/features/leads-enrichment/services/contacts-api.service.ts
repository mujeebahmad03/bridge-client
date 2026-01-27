// Contacts API Service
//
// - fetchContacts / createContact: real API (datatable GET, create POST).
// - Columns, delete, updateContactField: still mocked (in-memory store, simulateDelay).

import { API_ROUTES } from "@/config/api-routes";
import { apiClient, ApiError } from "@/lib/api-client";

import { type ApiResponse } from "@/types/api";

import type {
  Contact,
  ContactAddress,
  ContactColumn,
  ContactFieldId,
  ContactFieldValue,
  CreateContactPayload,
  CustomFieldId,
} from "@/leads/types";
import { DEFAULT_CONTACT_COLUMNS } from "@/leads/types";

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

const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** In-memory store for mock update/delete; populated by fetchContacts from API. */
let contactsStore: Contact[] = [];

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
      const list = extractContactList(raw);
      const contacts = list.map((r) => normalizeContact(r));
      contactsStore = contacts;
      return contacts;
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
}

const contactsApiService = new ContactsApiService();

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

/** Normalize backend contact to Contact (external_id, parseAddressString, top-level custom UUIDs). */
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
    id: String(raw.external_id ?? raw.id ?? ""),
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

let customColumns: ContactColumn[] = [];

export async function fetchContactColumns(): Promise<ContactColumn[]> {
  await simulateDelay(250);
  return [...DEFAULT_CONTACT_COLUMNS, ...customColumns];
}

export async function createCustomContactColumn(payload: {
  label: string;
  type?: ContactColumn["type"];
}): Promise<ContactColumn> {
  await simulateDelay(400);

  const id = `cf-${Date.now()}` as CustomFieldId;
  const newCol: ContactColumn = {
    id,
    label: payload.label,
    type: payload.type ?? "text",
    width: 160,
  };

  customColumns = [...customColumns, newCol];
  return newCol;
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
  await simulateDelay(400);
  const idSet = new Set(ids);
  contactsStore = contactsStore.filter((c) => !idSet.has(c.id));
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

const setNestedValue = (
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> => {
  const parts = path.split(".");
  const result = { ...obj };
  let current: Record<string, unknown> = result;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    current[part] = { ...((current[part] as Record<string, unknown>) || {}) };
    current = current[part] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
  return result;
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
  await simulateDelay(350);

  const { contactId, fieldId, value } = payload;
  const idx = contactsStore.findIndex((c) => c.id === contactId);
  if (idx === -1) {
    throw new Error("Contact not found");
  }

  const current = contactsStore[idx];
  const updatedAt = new Date().toISOString();

  let next: Contact;
  if (isCustomFieldId(fieldId)) {
    next = {
      ...current,
      custom_fields: {
        ...(current.custom_fields ?? {}),
        [fieldId]: value ?? "",
      },
      updated_at: updatedAt,
    };
  } else {
    next = setNestedValue(
      current as unknown as Record<string, unknown>,
      String(fieldId),
      value
    ) as Contact;
    next.updated_at = updatedAt;
    next.custom_fields = current.custom_fields ?? {};
  }

  contactsStore = [
    ...contactsStore.slice(0, idx),
    next,
    ...contactsStore.slice(idx + 1),
  ];

  return next;
}
