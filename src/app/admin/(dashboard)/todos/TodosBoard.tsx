"use client";

import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarClock, Check, CircleCheckBig, ListTodo, Plus, Search } from "lucide-react";
import { Badge, Button, Card, Chip, EmptyState, ErrorBanner, Input, PageHeader, Select, StatCard } from "@/components/admin/ui";
import { TODO_PRIORITY_TONE } from "@/components/admin/status";
import type { ClientOption, ProjectOption } from "@/lib/clients";
import { addDays, formatDayShort } from "@/lib/dates";
import type { TeamOption } from "@/lib/team";
import { TODO_PRIORITY_LABELS, emptyTodo, isTodoOverdue, todoToInput, type TodoInput, type TodoRow } from "@/lib/todos";
import { cn } from "@/lib/utils";
import TodoModal from "./TodoModal";
import { setTodoStatus } from "./actions";

const STATUS_FILTERS = ["open", "done", "all"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];
const STATUS_FILTER_LABELS: Record<StatusFilter, string> = { open: "Open", done: "Done", all: "All" };

/** Whose to-dos: "me", "all", "none" (unassigned) or a team member's id. */
type Who = string;

interface Group {
  key: string;
  label: string;
  todos: TodoRow[];
}

/** One to-do as a row: tick it off on the left, open it by clicking anywhere else. */
export function TodoListItem({
  todo,
  today,
  assignee,
  context,
  pending,
  onToggle,
  onOpen,
}: {
  todo: TodoRow;
  today: string;
  assignee?: string;
  /** "Client · Project", when it has one */
  context?: string;
  pending: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const done = todo.status === "done";
  const overdue = isTodoOverdue(todo, today);

  return (
    <li className="flex items-start gap-3 px-5 py-3 transition-colors duration-150 hover:bg-stone-50">
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        aria-label={done ? `Reopen "${todo.title}"` : `Mark "${todo.title}" as done`}
        aria-pressed={done}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 disabled:opacity-50 cursor-pointer",
          done ? "border-gold-500 bg-gold-500 text-stone-900" : "border-stone-300 bg-white text-transparent hover:border-gold-500 hover:text-gold-600"
        )}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </button>

      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 flex-col items-start gap-1 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer"
      >
        <span className={cn("text-sm font-medium", done ? "text-stone-400 line-through" : "text-stone-900")}>{todo.title}</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
          <span>{assignee ?? "Unassigned"}</span>
          {context && <span>· {context}</span>}
          {todo.due_date && <span className="tabular-nums">· due {formatDayShort(todo.due_date)}</span>}
        </span>
      </button>

      <span className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
        {overdue && <Badge className="border-stone-900 bg-stone-900 text-white">Overdue</Badge>}
        {!done && todo.status === "in_progress" && <Badge tone="soft">In progress</Badge>}
        {!done && todo.priority !== "normal" && <Badge tone={TODO_PRIORITY_TONE[todo.priority]}>{TODO_PRIORITY_LABELS[todo.priority]}</Badge>}
      </span>
    </li>
  );
}

export default function TodosBoard({
  todos,
  team,
  clients,
  projects,
  me,
  today,
  openId,
  startNew,
  newDue,
}: {
  todos: TodoRow[];
  team: TeamOption[];
  clients: ClientOption[];
  projects: ProjectOption[];
  me: string;
  today: string;
  openId?: string;
  startNew?: boolean;
  newDue?: string;
}) {
  const router = useRouter();
  const [who, setWho] = useState<Who>("me");
  const [status, setStatus] = useState<StatusFilter>("open");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // A link from the dashboard calendar can land here with a to-do to open or a new one to start
  const [editing, setEditing] = useState<TodoInput | null>(() => {
    const linked = openId ? todos.find((todo) => todo.id === openId) : undefined;
    if (linked) return todoToInput(linked);
    if (startNew) return emptyTodo({ assignee_id: me, due_date: newDue ?? "" });
    return null;
  });

  const names = useMemo(() => new Map(team.map((member) => [member.id, member.full_name])), [team]);
  const clientNames = useMemo(() => new Map(clients.map((client) => [client.id, client.name])), [clients]);
  const projectNames = useMemo(() => new Map(projects.map((project) => [project.id, project.name])), [projects]);

  const contextOf = (todo: TodoRow) =>
    [todo.client_id && clientNames.get(todo.client_id), todo.project_id && projectNames.get(todo.project_id)].filter(Boolean).join(" · ") || undefined;

  const weekEnd = addDays(today, 7);
  const weekAgo = addDays(today, -7);

  const stats = useMemo(() => {
    const open = todos.filter((todo) => todo.status !== "done");
    return {
      mine: open.filter((todo) => todo.assignee_id === me).length,
      today: open.filter((todo) => todo.due_date === today).length,
      overdue: open.filter((todo) => isTodoOverdue(todo, today)).length,
      doneThisWeek: todos.filter((todo) => todo.status === "done" && (todo.completed_at ?? "").slice(0, 10) >= weekAgo).length,
    };
  }, [todos, me, today, weekAgo]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return todos.filter((todo) => {
      if (who === "me" ? todo.assignee_id !== me : who === "none" ? todo.assignee_id !== null : who !== "all" && todo.assignee_id !== who) return false;
      if (status === "open" ? todo.status === "done" : status === "done" && todo.status !== "done") return false;
      return !q || todo.title.toLowerCase().includes(q) || todo.description.toLowerCase().includes(q);
    });
  }, [todos, who, status, query, me]);

  const groups = useMemo<Group[]>(() => {
    const open = visible.filter((todo) => todo.status !== "done");
    const done = visible
      .filter((todo) => todo.status === "done")
      .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""));
    const all: Group[] = [
      { key: "overdue", label: "Overdue", todos: open.filter((todo) => isTodoOverdue(todo, today)) },
      { key: "today", label: "Today", todos: open.filter((todo) => todo.due_date === today) },
      { key: "week", label: "Next 7 days", todos: open.filter((todo) => todo.due_date && todo.due_date > today && todo.due_date <= weekEnd) },
      { key: "later", label: "Later", todos: open.filter((todo) => todo.due_date && todo.due_date > weekEnd) },
      { key: "undated", label: "No due date", todos: open.filter((todo) => !todo.due_date) },
      { key: "done", label: "Done", todos: done },
    ];
    return all.filter((group) => group.todos.length > 0);
  }, [visible, today, weekEnd]);

  const toggle = (todo: TodoRow) => {
    setError(null);
    setPendingId(todo.id);
    startTransition(async () => {
      const res = await setTodoStatus(todo.id, todo.status === "done" ? "todo" : "done");
      setPendingId(null);
      if (!res.success) setError(res.error);
      else router.refresh();
    });
  };

  const closeModal = () => {
    setEditing(null);
    // Drop ?open= / ?new= so a refresh doesn't reopen the modal
    if (openId || startNew) router.replace("/admin/todos");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="To-dos"
        description="Tasks for the team, with who is doing them and when they're due. Due dates show on the dashboard calendar."
        action={
          <Button onClick={() => setEditing(emptyTodo({ assignee_id: me }))}>
            <Plus className="h-4 w-4" />
            New to-do
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="My open to-dos" value={stats.mine} icon={ListTodo} emphasis />
        <StatCard label="Due today" value={stats.today} icon={CalendarClock} hint="Across the team" />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} hint={stats.overdue === 0 ? "Nothing is late" : "Across the team"} />
        <StatCard label="Done · last 7 days" value={stats.doneThisWeek} icon={CircleCheckBig} />
      </div>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select aria-label="Whose to-dos" className="w-48" value={who} onChange={(e) => setWho(e.target.value)}>
            <option value="me">Assigned to me</option>
            <option value="all">Everyone</option>
            <option value="none">Unassigned</option>
            {team
              .filter((member) => member.id !== me)
              .map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name}
                </option>
              ))}
          </Select>
          <div className="flex gap-2" role="group" aria-label="Filter by status">
            {STATUS_FILTERS.map((filter) => (
              <Chip key={filter} selected={status === filter} onClick={() => setStatus(filter)}>
                {STATUS_FILTER_LABELS[filter]}
              </Chip>
            ))}
          </div>
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input type="search" aria-label="Search to-dos" placeholder="Search to-dos" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={todos.length === 0 ? ListTodo : Search}
            title={todos.length === 0 ? "No to-dos yet" : status === "open" ? "Nothing open here" : "Nothing matches"}
            description={
              todos.length === 0
                ? "Add the first one and assign it to someone on the team."
                : who === "me" && status === "open"
                  ? "You have no open to-dos. Switch to Everyone to see the rest of the team's."
                  : "Try a different person, status or search term."
            }
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <Card key={group.key} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
                <h2 className="text-sm font-semibold text-stone-900">{group.label}</h2>
                <span className="text-xs tabular-nums text-stone-500">{group.todos.length}</span>
              </div>
              <ul className="divide-y divide-stone-200">
                {group.todos.map((todo) => (
                  <TodoListItem
                    key={todo.id}
                    todo={todo}
                    today={today}
                    assignee={todo.assignee_id ? names.get(todo.assignee_id) : undefined}
                    context={contextOf(todo)}
                    pending={pendingId === todo.id}
                    onToggle={() => toggle(todo)}
                    onOpen={() => setEditing(todoToInput(todo))}
                  />
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <TodoModal
          key={editing.id ?? "new"}
          initial={editing}
          team={team}
          clients={clients}
          projects={projects}
          onClose={closeModal}
          onSaved={() => {
            closeModal();
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
