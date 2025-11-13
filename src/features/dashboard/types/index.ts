export interface ContactInteractionEvent {
  contact: string;
  interaction_channel: "EMAIL" | "PHONE" | "LINKEDIN" | string;
  event_type:
    | "EMAIL_SENT"
    | "EMAIL_OPENED"
    | "CALL_MADE"
    | "MESSAGE_SENT"
    | string;
  occurred_at: string; // ISO 8601 timestamp
  performed_by: string; // Source system or identifier (e.g., "BRIDGE")
  user_performed_by: string; // UUID of the user who performed the action
  event_data: string; // Additional event data, may contain JSON or other structured info
}
