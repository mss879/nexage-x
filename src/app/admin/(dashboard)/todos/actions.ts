"use server";

import { revalidatePath } from "next/cache";
import { makeFail, type Result } from "@/lib/action-result";
import { requireAdmin, requireAdminContext } from "@/lib/admin-auth";
import type { ClientOption, ProjectOption } from "@/lib/clients";
import { isUuid } from "@/lib/sanitize";
import type { TeamOption } from "@/lib/team";
import { TODO_COLUMNS, TODO_STATUSES, sanitizeTodo, todoToRow, type TodoRow, type TodoStatus } from "@/lib/todos";
import { listClientOptions } from "../clients/actions";

const fail = makeFail({
  missing: "The to-dos table doesn't exist yet.",
  inUse: "The person, client or project you picked no longer exists.",
});

/** To-dos appear on their own page, the dashboard calendar, the sidebar badge and the client page. */
const refresh = (clientId?: string | null) => {
  revalidatePath("/admin/todos");
  revalidatePath("/admin", "layout");
  if (clientId) revalidatePath(`/admin/clients/${clientId}`);
};

export interface TodoBoardData {
  todos: TodoRow[];
  team: TeamOption[];
  clients: ClientOption[];
  projects: ProjectOption[];
  /** The signed-in person's id */
  me: string;
}

export async function getTodoBoard(): Promise<Result<TodoBoardData>> {
  try {
    const { supabase, admin } = await requireAdminContext();
    const [todosRes, teamRes, options] = await Promise.all([
      supabase
        .from("todos")
        .select(TODO_COLUMNS)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase.from("team_members").select("id, full_name, active").order("full_name"),
      listClientOptions(),
    ]);
    if (todosRes.error) return fail(todosRes.error);
    if (teamRes.error) return fail(teamRes.error);

    return {
      success: true,
      todos: (todosRes.data ?? []) as TodoRow[],
      team: (teamRes.data ?? []) as TeamOption[],
      clients: options.clients,
      projects: options.projects,
      me: admin.id,
    };
  } catch (error) {
    return fail(error);
  }
}

export async function saveTodo(input: unknown): Promise<Result<{ id: string }>> {
  try {
    const parsed = sanitizeTodo(input);
    if ("error" in parsed) return { success: false, error: parsed.error };
    const { todo } = parsed;
    const row = todoToRow(todo);

    const supabase = await requireAdmin();
    const query = todo.id
      ? supabase.from("todos").update(row).eq("id", todo.id).select("id, client_id").maybeSingle()
      : supabase.from("todos").insert(row).select("id, client_id").single();
    const { data, error } = await query;
    if (error) return fail(error);
    if (!data) return { success: false, error: "To-do not found — it may have been deleted." };

    refresh(data.client_id as string | null);
    return { success: true, id: data.id as string };
  } catch (error) {
    return fail(error);
  }
}

export async function setTodoStatus(id: string, status: TodoStatus): Promise<Result> {
  try {
    if (!isUuid(id) || !TODO_STATUSES.includes(status)) return { success: false, error: "Invalid request." };
    const supabase = await requireAdmin();
    const { data, error } = await supabase.from("todos").update({ status }).eq("id", id).select("client_id").maybeSingle();
    if (error) return fail(error);
    refresh(data?.client_id as string | null);
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTodo(id: string): Promise<Result> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invalid request." };
    const supabase = await requireAdmin();
    const { data, error } = await supabase.from("todos").delete().eq("id", id).select("client_id").maybeSingle();
    if (error) return fail(error);
    refresh(data?.client_id as string | null);
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}
