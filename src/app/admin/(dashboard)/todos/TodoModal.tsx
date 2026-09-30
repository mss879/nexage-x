"use client";

import React, { useId, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button, Chip, ErrorBanner, Field, Input, Modal, Select, Textarea } from "@/components/admin/ui";
import type { ClientOption, ProjectOption } from "@/lib/clients";
import type { TeamOption } from "@/lib/team";
import { TODO_PRIORITIES, TODO_PRIORITY_LABELS, TODO_STATUSES, TODO_STATUS_LABELS, type TodoInput, type TodoPriority, type TodoStatus } from "@/lib/todos";
import { deleteTodo, saveTodo } from "./actions";

/**
 * Create or edit one to-do. Used by the to-dos page and by a client's page
 * (where the client is fixed). Calls onSaved after a successful save or delete.
 */
export default function TodoModal({
  initial,
  team,
  clients,
  projects,
  lockClient = false,
  onClose,
  onSaved,
}: {
  initial: TodoInput;
  team: TeamOption[];
  clients: ClientOption[];
  projects: ProjectOption[];
  /** The to-do belongs to the client it was opened from */
  lockClient?: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const uid = useId();
  const [form, setForm] = useState<TodoInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, startSaving] = useTransition();

  const set = <K extends keyof TodoInput>(key: K, value: TodoInput[K]) => setForm((f) => ({ ...f, [key]: value }));
  const id = (name: string) => `${uid}-${name}`;
  const isEdit = Boolean(initial.id);

  // Deactivated people can't be given new work, but stay selectable on a to-do they already have
  const assignable = team.filter((member) => member.active || member.id === form.assignee_id);
  const clientProjects = projects.filter((project) => !form.client_id || project.client_id === form.client_id);

  const pickProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    // A project always belongs to one client — picking it sets the client too
    setForm((f) => ({ ...f, project_id: projectId, client_id: project ? project.client_id : f.client_id }));
  };

  const pickClient = (clientId: string) =>
    setForm((f) => ({
      ...f,
      client_id: clientId,
      project_id: projects.some((p) => p.id === f.project_id && p.client_id === clientId) ? f.project_id : "",
    }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startSaving(async () => {
      const res = await saveTodo(form);
      if (!res.success) setError(res.error);
      else onSaved();
    });
  };

  const remove = () => {
    if (!initial.id) return;
    setError(null);
    startSaving(async () => {
      const res = await deleteTodo(initial.id as string);
      if (!res.success) {
        setError(res.error);
        setConfirmDelete(false);
      } else onSaved();
    });
  };

  return (
    <Modal title={isEdit ? "Edit to-do" : "New to-do"} onClose={onClose} className="max-w-xl">
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <ErrorBanner>{error}</ErrorBanner>}

        <Field label="What needs doing" htmlFor={id("title")}>
          <Input id={id("title")} required maxLength={200} autoFocus={!isEdit} value={form.title} onChange={(e) => set("title", e.target.value)} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Assigned to" htmlFor={id("assignee")}>
            <Select id={id("assignee")} value={form.assignee_id} onChange={(e) => set("assignee_id", e.target.value)}>
              <option value="">Nobody yet</option>
              {assignable.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name}
                  {member.active ? "" : " (deactivated)"}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Due date" htmlFor={id("due")}>
            <Input id={id("due")} type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Priority">
            <div className="flex gap-2" role="group" aria-label="Priority">
              {TODO_PRIORITIES.map((priority: TodoPriority) => (
                <Chip key={priority} selected={form.priority === priority} onClick={() => set("priority", priority)}>
                  {TODO_PRIORITY_LABELS[priority]}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label="Status" htmlFor={id("status")}>
            <Select id={id("status")} value={form.status} onChange={(e) => set("status", e.target.value as TodoStatus)}>
              {TODO_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {TODO_STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {clients.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Client (optional)" htmlFor={id("client")}>
              <Select id={id("client")} value={form.client_id} disabled={lockClient} onChange={(e) => pickClient(e.target.value)}>
                <option value="">No client</option>
                {clients
                  .filter((client) => client.status === "active" || client.id === form.client_id)
                  .map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Project (optional)" htmlFor={id("project")}>
              <Select id={id("project")} value={form.project_id} disabled={clientProjects.length === 0} onChange={(e) => pickProject(e.target.value)}>
                <option value="">{clientProjects.length === 0 ? "No projects" : "No project"}</option>
                {clientProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        )}

        <Field label="Details (optional)" htmlFor={id("description")}>
          <Textarea id={id("description")} rows={3} maxLength={4000} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>

        <div className="flex items-center justify-between gap-2">
          {isEdit ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-600">Delete for good?</span>
                <Button variant="danger" size="sm" onClick={remove} disabled={saving}>
                  Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                  Keep
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save" : "Add to-do"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
