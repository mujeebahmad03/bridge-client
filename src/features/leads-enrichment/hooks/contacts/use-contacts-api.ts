import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createContact,
  createCustomContactColumn,
  deleteContacts,
  fetchContactColumns,
  fetchContacts,
  updateContactField,
} from "@/leads/services";
import { useContactsTableStore } from "@/leads/stores";
import type {
  Contact,
  ContactColumn,
  ContactFieldId,
  ContactFieldValue,
  CreateContactPayload,
} from "@/leads/types";

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

function isCustomFieldId(fieldId: ContactFieldId): boolean {
  return String(fieldId).startsWith("cf-");
}

function applyOptimisticFieldUpdate(
  contact: Contact,
  fieldId: ContactFieldId,
  value: ContactFieldValue
): Contact {
  if (isCustomFieldId(fieldId)) {
    return {
      ...contact,
      custom_fields: {
        ...(contact.custom_fields ?? {}),
        [fieldId]: value,
      },
      updated_at: new Date().toISOString(),
    };
  }

  const next = setNestedValue(
    contact as unknown as Record<string, unknown>,
    String(fieldId),
    value
  ) as Contact;
  next.custom_fields = contact.custom_fields ?? {};
  next.updated_at = new Date().toISOString();
  return next;
}

export const contactsKeys = {
  all: ["contacts"] as const,
  list: (params: { search?: string }) =>
    [...contactsKeys.all, "list", params] as const,
  columns: () => [...contactsKeys.all, "columns"] as const,
};

export function useContactsQuery(params: { search?: string }) {
  return useQuery({
    queryKey: contactsKeys.list(params),
    queryFn: () => fetchContacts(params),
    staleTime: 10_000,
  });
}

export function useContactColumnsQuery() {
  return useQuery({
    queryKey: contactsKeys.columns(),
    queryFn: fetchContactColumns,
    staleTime: 30_000,
  });
}

export function useCreateContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateContactPayload) => createContact(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.all });
    },
  });
}

export function useDeleteContactsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => deleteContacts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.all });
    },
  });
}

export function useUpdateContactFieldMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      contactId: string;
      fieldId: ContactFieldId;
      value: ContactFieldValue;
    }) => updateContactField(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: contactsKeys.all });

      const prev = queryClient.getQueriesData<Contact[]>({
        queryKey: contactsKeys.all,
      });

      // Optimistically update all cached lists (different searches) for consistent UI.
      prev.forEach(([key, data]) => {
        if (!data) {
          return;
        }
        queryClient.setQueryData<Contact[]>(key, (old) => {
          if (!old) {
            return old;
          }
          return old.map((c) =>
            c.id === payload.contactId
              ? applyOptimisticFieldUpdate(c, payload.fieldId, payload.value)
              : c
          );
        });
      });

      return { prev };
    },
    onError: (_err, _payload, ctx) => {
      ctx?.prev?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.all });
    },
  });
}

export function useCreateContactColumnMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { label: string; type?: ContactColumn["type"] }) =>
      createCustomContactColumn(payload),
    onSuccess: (newColumn) => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.columns() });
      // Add new column to column order
      const store = useContactsTableStore.getState();
      const currentOrder = store.columnOrder;
      if (!currentOrder.includes(newColumn.id)) {
        store.setColumnOrder([...currentOrder, newColumn.id]);
      }
    },
  });
}
