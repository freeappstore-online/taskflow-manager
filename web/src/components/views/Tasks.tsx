import { useState, useMemo } from "react";
import type { AppStore, Task, TaskStatus, Priority } from "../../types";
import type { StoreActions } from "../../hooks/useStore";
import { filterTasks } from "../../hooks/useStore";
import { Modal, ConfirmDialog } from "../ui/Modal";
import { Field, Input, Textarea, Select } from "../ui/FormField";
import { PriorityBadge, StatusBadge } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";

interface Props {
  state: AppStore;
  actions: StoreActions;
}

interface TaskFormData {
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  tagIds: string[];
  dueDate: string;
}

const STATUSES: TaskStatus[] = ["todo", "in_progress", "review", "done"];
const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

function makeDefaultForm(projectId: string): TaskFormData {
  return {
    projectId,
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    tagIds: [],
    dueDate: "",
  };
}

function TaskForm({
  initial,
  projects,
  tags,
  onSave,
  onCancel,
}: {
  initial: TaskFormData;
  projects: AppStore["projects"];
  tags: AppStore["tags"];
  onSave: (data: TaskFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<TaskFormData>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.projectId) e.projectId = "Select a project";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function toggleTag(id: string) {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(id) ? f.tagIds.filter((t) => t !== id) : [...f.tagIds, id],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Project" required error={errors.projectId}>
        <Select
          value={form.projectId}
          onChange={(e) => setForm({ ...form, projectId: e.target.value })}
        >
          <option value="">— Select project —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.icon} {p.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Task Title" required error={errors.title}>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="What needs to be done?"
          autoFocus
        />
      </Field>

      <Field label="Description">
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Add details, context, or acceptance criteria…"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </Field>

        <Field label="Priority">
          <Select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
        </Field>
      </div>

      <Field label="Due Date">
        <Input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        />
      </Field>

      {tags.length > 0 && (
        <Field label="Tags">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const sel = form.tagIds.includes(tag.id);
              return (
                <button
                  type="button"
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: sel ? tag.color : tag.color + "22",
                    color: sel ? "#fff" : tag.color,
                    border: `1px solid ${tag.color}66`,
                  }}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </Field>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "var(--line)", color: "var(--ink)" }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          Save Task
        </button>
      </div>
    </form>
  );
}

// ─── Kanban Column ─────────────────────────────────────────────────────────────

function KanbanColumn({
  status,
  tasks,
  projects,
  tags,
  onEdit,
  onDelete,
  onMove,
  onComplete,
  onReopen,
}: {
  status: TaskStatus;
  tasks: Task[];
  projects: AppStore["projects"];
  tags: AppStore["tags"];
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, s: TaskStatus) => void;
  onComplete: (id: string) => void;
  onReopen: (id: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);

  const COLUMN_COLORS: Record<TaskStatus, string> = {
    todo: "#6b7280",
    in_progress: "#2563eb",
    review: "#7c3aed",
    done: "#16a34a",
  };

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden min-w-[260px] flex-1"
      style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
    >
      {/* Column header */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLUMN_COLORS[status] }} />
          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
            {STATUS_LABELS[status]}
          </span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "var(--line)", color: "var(--muted)" }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
        {tasks.length === 0 && (
          <div className="text-xs text-center py-6" style={{ color: "var(--muted)" }}>
            No tasks here
          </div>
        )}
        {tasks.map((task) => {
          const proj = projects.find((p) => p.id === task.projectId);
          const isOverdue = task.dueDate && task.dueDate < today && task.status !== "done";
          const taskTags = tags.filter((t) => task.tagIds.includes(t.id));

          return (
            <div
              key={task.id}
              className="rounded-xl p-3 space-y-2 group"
              style={{
                background: "var(--paper)",
                border: isOverdue ? "1px solid var(--danger)" : "1px solid var(--line)",
              }}
            >
              {/* Priority + project */}
              <div className="flex items-center justify-between">
                <PriorityBadge priority={task.priority} />
                {proj && (
                  <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                    {proj.icon} {proj.name}
                  </span>
                )}
              </div>

              {/* Title */}
              <div
                className="text-sm font-semibold"
                style={{
                  color: "var(--ink)",
                  textDecoration: task.status === "done" ? "line-through" : "none",
                  opacity: task.status === "done" ? 0.6 : 1,
                }}
              >
                {task.title}
              </div>

              {/* Description */}
              {task.description && (
                <div className="text-xs line-clamp-2" style={{ color: "var(--muted)" }}>
                  {task.description}
                </div>
              )}

              {/* Tags */}
              {taskTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {taskTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                      style={{ background: tag.color + "22", color: tag.color }}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Due date */}
              {task.dueDate && (
                <div
                  className="text-xs font-medium"
                  style={{ color: isOverdue ? "var(--danger)" : "var(--muted)" }}
                >
                  {isOverdue ? "⚠️ " : "📅 "}Due {task.dueDate}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-1 pt-1">
                {/* Move status */}
                {STATUSES.filter((s) => s !== status).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      if (s === "done") onComplete(task.id);
                      else if (status === "done") onReopen(task.id);
                      else onMove(task.id, s);
                    }}
                    className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-opacity hover:opacity-80"
                    style={{ background: "var(--line)", color: "var(--ink)" }}
                    title={`Move to ${STATUS_LABELS[s]}`}
                  >
                    → {STATUS_LABELS[s]}
                  </button>
                ))}
                <div className="flex-1" />
                <button
                  onClick={() => onEdit(task)}
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-opacity hover:opacity-80"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-opacity hover:opacity-70"
                  style={{ background: "var(--danger)", color: "#fff" }}
                >
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tasks View ───────────────────────────────────────────────────────────────

export function Tasks({ state, actions }: Props) {
  const { tasks, projects, tags, activeProjectId } = state;

  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [filters, setFilters] = useState({
    search: "",
    status: "all" as string,
    priority: "all" as string,
    tagIds: [] as string[],
  });

  const activeProject = activeProjectId ? projects.find((p) => p.id === activeProjectId) : null;

  const scopedTasks = useMemo(
    () => (activeProjectId ? tasks.filter((t) => t.projectId === activeProjectId) : tasks),
    [tasks, activeProjectId]
  );

  const filteredTasks = useMemo(() => filterTasks(scopedTasks, filters), [scopedTasks, filters]);

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], review: [], done: [] };
    filteredTasks.forEach((t) => map[t.status].push(t));
    return map;
  }, [filteredTasks]);

  function handleAdd(data: TaskFormData) {
    actions.addTask({
      ...data,
      dueDate: data.dueDate || null,
    });
    setShowAdd(false);
  }

  function handleEdit(data: TaskFormData) {
    if (!editTask) return;
    actions.updateTask(editTask.id, {
      ...data,
      dueDate: data.dueDate || null,
    });
    setEditTask(null);
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div
        className="px-6 md:px-8 py-5 border-b flex flex-wrap items-center gap-3"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
            {activeProject ? `${activeProject.icon} ${activeProject.name}` : "All Tasks"}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
            {activeProjectId && (
              <button
                onClick={() => actions.setActiveProject(null)}
                className="ml-2 underline"
                style={{ color: "var(--accent)" }}
              >
                Clear filter
              </button>
            )}
          </p>
        </div>

        {/* View toggle */}
        <div
          className="flex rounded-xl overflow-hidden border"
          style={{ borderColor: "var(--line)" }}
        >
          {(["kanban", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1.5 text-xs font-semibold capitalize transition-colors"
              style={{
                background: view === v ? "var(--accent)" : "var(--panel)",
                color: view === v ? "#fff" : "var(--ink)",
              }}
            >
              {v === "kanban" ? "🗂 Kanban" : "📋 List"}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Task
        </button>
      </div>

      {/* ── Filters bar ── */}
      <div
        className="px-6 md:px-8 py-3 border-b flex flex-wrap gap-2"
        style={{ borderColor: "var(--line)", background: "var(--panel)" }}
      >
        <input
          className="px-3 py-1.5 rounded-xl text-xs border outline-none"
          style={{ background: "var(--paper)", color: "var(--ink)", borderColor: "var(--line)", minWidth: "160px" }}
          placeholder="🔍 Search tasks…"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select
          className="px-3 py-1.5 rounded-xl text-xs border outline-none cursor-pointer"
          style={{ background: "var(--paper)", color: "var(--ink)", borderColor: "var(--line)" }}
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select
          className="px-3 py-1.5 rounded-xl text-xs border outline-none cursor-pointer"
          style={{ background: "var(--paper)", color: "var(--ink)", borderColor: "var(--line)" }}
          value={filters.priority}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {/* Project filter (when not scoped) */}
        {!activeProjectId && (
          <select
            className="px-3 py-1.5 rounded-xl text-xs border outline-none cursor-pointer"
            style={{ background: "var(--paper)", color: "var(--ink)", borderColor: "var(--line)" }}
            onChange={(e) => actions.setActiveProject(e.target.value || null)}
          >
            <option value="">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
          </select>
        )}
      </div>

      {/* ── Content ── */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon="✅"
          title="No tasks found"
          description="Create a task or adjust your filters."
          action={{ label: "New Task", onClick: () => setShowAdd(true) }}
        />
      ) : view === "kanban" ? (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full" style={{ minWidth: "900px" }}>
            {STATUSES.map((s) => (
              <KanbanColumn
                key={s}
                status={s}
                tasks={tasksByStatus[s]}
                projects={projects}
                tags={tags}
                onEdit={setEditTask}
                onDelete={setDeleteId}
                onMove={actions.moveTaskStatus}
                onComplete={actions.completeTask}
                onReopen={actions.reopenTask}
              />
            ))}
          </div>
        </div>
      ) : (
        <ListView
          tasks={filteredTasks}
          projects={projects}
          tags={tags}
          onEdit={setEditTask}
          onDelete={setDeleteId}
          onComplete={actions.completeTask}
          onReopen={actions.reopenTask}
        />
      )}

      {/* ── Modals ── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Task" maxWidth="36rem">
        <TaskForm
          initial={makeDefaultForm(activeProjectId ?? (projects[0]?.id ?? ""))}
          projects={projects}
          tags={tags}
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>

      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" maxWidth="36rem">
        {editTask && (
          <TaskForm
            initial={{
              projectId: editTask.projectId,
              title: editTask.title,
              description: editTask.description,
              status: editTask.status,
              priority: editTask.priority,
              tagIds: editTask.tagIds,
              dueDate: editTask.dueDate ?? "",
            }}
            projects={projects}
            tags={tags}
            onSave={handleEdit}
            onCancel={() => setEditTask(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) actions.deleteTask(deleteId); }}
        title="Delete Task"
        message="Are you sure you want to delete this task? This cannot be undone."
        danger
      />
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────

function ListView({
  tasks,
  projects,
  tags,
  onEdit,
  onDelete,
  onComplete,
  onReopen,
}: {
  tasks: Task[];
  projects: AppStore["projects"];
  tags: AppStore["tags"];
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onReopen: (id: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-4 space-y-2">
      {tasks.map((task) => {
        const proj = projects.find((p) => p.id === task.projectId);
        const taskTags = tags.filter((t) => task.tagIds.includes(t.id));
        const isOverdue = task.dueDate && task.dueDate < today && task.status !== "done";

        return (
          <div
            key={task.id}
            className="flex items-start gap-3 p-4 rounded-2xl transition-all hover:shadow-sm"
            style={{
              background: "var(--panel)",
              border: isOverdue ? "1px solid var(--danger)" : "1px solid var(--line)",
            }}
          >
            {/* Checkbox */}
            <button
              onClick={() => task.status === "done" ? onReopen(task.id) : onComplete(task.id)}
              className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
              style={{
                borderColor: task.status === "done" ? "var(--success)" : "var(--line-strong)",
                background: task.status === "done" ? "var(--success)" : "transparent",
              }}
            >
              {task.status === "done" && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--ink)",
                    textDecoration: task.status === "done" ? "line-through" : "none",
                    opacity: task.status === "done" ? 0.6 : 1,
                  }}
                >
                  {task.title}
                </span>
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
              </div>

              {task.description && (
                <p className="text-xs mb-2 line-clamp-1" style={{ color: "var(--muted)" }}>
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
                {proj && <span>{proj.icon} {proj.name}</span>}
                {task.dueDate && (
                  <span style={{ color: isOverdue ? "var(--danger)" : "var(--muted)" }}>
                    {isOverdue ? "⚠️ " : "📅 "}{task.dueDate}
                  </span>
                )}
                {taskTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-1.5 py-0.5 rounded font-semibold"
                    style={{ background: tag.color + "22", color: tag.color }}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ background: "var(--danger)", color: "#fff" }}
              >
                🗑
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
