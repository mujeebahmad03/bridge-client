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

export interface Task {
  id: string; // UUID of the task
  created_at: string; // ISO 8601 timestamp for when the task was created
  last_modified_at: string; // ISO 8601 timestamp for last modification
  title: string; // Task title or subject
  content: string; // Detailed task description or notes
  related_contacts: string[]; // List of related contact UUIDs
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"; // Task priority
  created_by: string; // UUID of the user who created the task
  assigned_to: string; // UUID of the user the task is assigned to
  due_at: string; // ISO 8601 timestamp for task due date
  completed_at: string | null; // ISO 8601 timestamp for completion (nullable if not completed)
}
