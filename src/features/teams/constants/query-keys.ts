export const TEAM_QUERY_KEYS = {
  all: ["teams"] as const,
  list: () => [...TEAM_QUERY_KEYS.all, "list"] as const,
  details: (id: string) => [...TEAM_QUERY_KEYS.all, "details", id] as const,
} as const;
