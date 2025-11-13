export const TEAM_QUERY_KEYS = {
  all: ["teams"] as const,
  list: () => [...TEAM_QUERY_KEYS.all, "list"] as const,
  details: (id: string) => [...TEAM_QUERY_KEYS.all, "details", id] as const,
  members: (teamId: string) =>
    [...TEAM_QUERY_KEYS.all, "members", teamId] as const,
  invites: (teamId: string) =>
    [...TEAM_QUERY_KEYS.all, "invites", teamId] as const,
} as const;
