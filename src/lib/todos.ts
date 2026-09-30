/** To-dos — shared types and validation. */
import { isIsoDate, todayInDubai } from "@/lib/dates";
import { cleanText, oneOf, uuidOrNull } from "@/lib/sanitize";

export const TODO_STATUSES = ["todo", "in_progress", "done"] as const;
export type TodoStatus = (typeof TODO_STATUSES)[number];

export const TODO_STATUS_LABELS: Record<TodoStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const TODO_PRIORITIES = ["low", "normal", "high"] as const;
export type TodoPriority = (typeof TODO_PRIORITIES)[number];

export const TODO_PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

export interface TodoRow {
  id: string;
  created_at: string;
  title: string;
  description: string;
  status: TodoStatus;
  priority: TodoPriority;
  /** YYYY-MM-DD */
  due_date: string | null;
  completed_at: string | null;
  assignee_id: string | null;
  client_id: string | null;
  project_id: string | null;
  created_by: string | null;
}

export const TODO_COLUMNS =
  "id, created_at, title, description, status, priority, due_date, completed_at, assignee_id, client_id, project_id, created_by";

export interface TodoInput {
  id?: string;
  title: string;
  description: string;
  status: TodoStatus;
  priority: TodoPriority;
  due_date: string;
  assignee_id: string;
  client_id: string;
  project_id: string;
}

export const emptyTodo = (defaults: Partial<TodoInput> = {}): TodoInput => ({
  title: "",
  description: "",
  status: "todo",
  priority: "normal",
  due_date: "",
  assignee_id: "",
  client_id: "",
  project_id: "",
  ...defaults,
});

export const todoToInput = (todo: TodoRow): TodoInput => ({
  id: todo.id,
  title: todo.title,
  description: todo.description,
  status: todo.status,
  priority: todo.priority,
  due_date: todo.due_date ?? "",
  assignee_id: todo.assignee_id ?? "",
  client_id: todo.client_id ?? "",
  project_id: todo.project_id ?? "",
});

export function sanitizeTodo(input: unknown): { todo: TodoInput } | { error: string } {
  const raw = (input ?? {}) as Record<string, unknown>;
  const title = cleanText(raw.title, 200);
  if (!title) return { error: "Say what needs doing." };

  return {
    todo: {
      id: uuidOrNull(raw.id) ?? undefined,
      title,
      description: cleanText(raw.description, 4000),
      status: oneOf(raw.status, TODO_STATUSES, "todo"),
      priority: oneOf(raw.priority, TODO_PRIORITIES, "normal"),
      due_date: isIsoDate(raw.due_date) ? raw.due_date : "",
      assignee_id: uuidOrNull(raw.assignee_id) ?? "",
      client_id: uuidOrNull(raw.client_id) ?? "",
      project_id: uuidOrNull(raw.project_id) ?? "",
    },
  };
}

/** The row as the database stores it ("" → null). */
export const todoToRow = (todo: TodoInput) => ({
  title: todo.title,
  description: todo.description,
  status: todo.status,
  priority: todo.priority,
  due_date: todo.due_date || null,
  assignee_id: todo.assignee_id || null,
  client_id: todo.client_id || null,
  project_id: todo.project_id || null,
});

/** Not done and past its due date. */
export const isTodoOverdue = (todo: Pick<TodoRow, "status" | "due_date">, today = todayInDubai()) =>
  todo.status !== "done" && Boolean(todo.due_date) && (todo.due_date as string) < today;
