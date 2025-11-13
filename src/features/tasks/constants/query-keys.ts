export const TASK_QUERY_KEYS = {
  all: ["tasks"] as const,
  list: () => [...TASK_QUERY_KEYS.all, "list"] as const,
  details: (id: string) => [...TASK_QUERY_KEYS.all, "details", id] as const,
} as const;
