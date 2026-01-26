// Mock Contacts API Service
//
// This mirrors the style of `src/services/api.ts` / `src/services/enrichmentApi.ts`:
// - in-memory store
// - simulated latency
// - async functions returning typed results

import type {
  Contact,
  ContactColumn,
  ContactFieldId,
  ContactFieldValue,
  CreateContactPayload,
  CustomFieldId,
} from "@/leads/types";
import { DEFAULT_CONTACT_COLUMNS } from "@/leads/types";

const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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

// -------------------- Contacts --------------------

const randomFrom = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const generateMockContacts = (count: number): Contact[] => {
  const firstNames = [
    "John",
    "Jane",
    "Michael",
    "Sarah",
    "David",
    "Emily",
    "Chris",
    "Lisa",
    "James",
    "Amanda",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Martinez",
    "Wilson",
  ];
  const cities = [
    "New York",
    "San Francisco",
    "Austin",
    "Chicago",
    "Seattle",
    "Boston",
    "Los Angeles",
    "Miami",
  ];
  const countries = ["US", "CA", "GB", "AU", "DE"];

  return Array.from({ length: count }, (_, i) => ({
    id: `contact-${i + 1}`,
    first_name: randomFrom(firstNames),
    last_name: randomFrom(lastNames),
    other_names: Math.random() > 0.7 ? "Jr." : "",
    email_address: `contact${i + 1}@example.com`,
    acquisition_source: "WEBSITE",
    address: {
      addressLine1: `${Math.floor(Math.random() * 9999)} Main St`,
      addressLine2:
        Math.random() > 0.7 ? `Suite ${Math.floor(Math.random() * 100)}` : "",
      street: "Main Street",
      city: randomFrom(cities),
      state: "CA",
      zipCode: String(10000 + Math.floor(Math.random() * 89999)),
      country: randomFrom(countries),
    },
    is_potential_lead: Math.random() > 0.5,
    created_at: new Date(
      Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
    ).toISOString(),
    updated_at: new Date().toISOString(),
    custom_fields: {},
  }));
};

let contactsStore: Contact[] = generateMockContacts(10_000);

export async function fetchContacts(params?: {
  search?: string;
}): Promise<Contact[]> {
  await simulateDelay(400);

  const search = params?.search?.trim().toLowerCase();
  if (!search) {
    return contactsStore;
  }

  return contactsStore.filter((c) => {
    const haystack: string[] = [
      c.first_name,
      c.last_name,
      c.other_names,
      c.email_address,
      c.acquisition_source,
      c.address?.city,
      c.address?.country,
    ]
      .filter(Boolean)
      .map((v) => String(v).toLowerCase());

    const customVals = Object.values(c.custom_fields ?? {}).map((v) =>
      String(v ?? "").toLowerCase()
    );

    return [...haystack, ...customVals].some((v) => v.includes(search));
  });
}

export async function createContact(
  payload: CreateContactPayload
): Promise<Contact> {
  await simulateDelay(500);

  const now = new Date().toISOString();
  const newContact: Contact = {
    id: `contact-${Date.now()}`,
    first_name: payload.first_name,
    last_name: payload.last_name,
    other_names: payload.other_names ?? "",
    email_address: payload.email_address,
    acquisition_source: payload.acquisition_source,
    address: {
      addressLine1: payload.address?.addressLine1 ?? "",
      addressLine2: payload.address?.addressLine2 ?? "",
      street: payload.address?.street ?? "",
      city: payload.address?.city ?? "",
      state: payload.address?.state ?? "",
      zipCode: payload.address?.zipCode ?? "",
      country: payload.address?.country ?? "",
    },
    is_potential_lead: payload.is_potential_lead ?? true,
    created_at: now,
    updated_at: now,
    custom_fields: {},
  };

  contactsStore = [newContact, ...contactsStore];
  return newContact;
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
