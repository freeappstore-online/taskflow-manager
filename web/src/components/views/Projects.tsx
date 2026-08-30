import { useState, useMemo } from "react";
import type { AppStore, Project, ProjectStatus } from "../../types";
import type { StoreActions } from "../../hooks/useStore";
import { computeProjectStats } from "../../lib/analytics";
import { Modal, ConfirmDialog } from "../ui/Modal";
import { Field, Input, Textarea, Select } from "../ui/FormField";
import { ProjectStatusBadge } from "../ui/Badge";
import { ProgressRing } from "../ui/ProgressRing";
import { EmptyState } from "../ui/EmptyState";

interface Props {
  state: AppStore;
  actions: StoreActions;
}

const PROJECT_COLORS = [
  "#6366f1","#0ea5e9","#22c55e","#f59e0b","#ec4899","#ef4444","#8b5cf6","#14b8a6",
];

const PROJECT_ICONS = ["🌐","📱","⚡","🚀","🎯","📊","🔧","🎨","📦","🔬","💡","🏗️"];

interface ProjectFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  status: ProjectStatus;
}

const DEFAULT_FORM: ProjectFormData = {
  name: "",
  description: "",
  color: PROJECT_COLORS[0],
  icon: PROJECT_ICONS[0],
  status: "active",
};

function ProjectForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: ProjectFormData;
  onSave: (data: ProjectFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ProjectFormData>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Project Name" required error={errors.name}>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Website Redesign"
          autoFocus
        />
      </Field>

      <Field label="Description">
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="What is this project about?"
        />
      </Field>

      <Field label="Status">
        <Select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </Select>
      </Field>

      {/* Icon picker */}
      <Field label="Icon">
        <div className="flex flex-wrap gap-2">
          {PROJECT_ICONS.map((icon) => (
            <button
              type="button"
              key={icon}
              onClick={() => setForm({ ...form, icon })}
              className="w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all"
              style={{
                background: form.icon === icon ? "var(--accent)" : "var(--line)",
                transform: form.icon === icon ? "scale(1.15)" : "scale(1)",
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </Field>

      {/* Color picker */}
      <Field label="Color">
        <div className="flex flex-wrap gap-2">
          {PROJECT_COLORS.map((color) => (
            <button
              type="button"
              key={color}
              onClick={() => setForm({ ...form, color })}
              className="w-7 h-7 rounded-full transition-all"
              style={{
                background: color,
                outline: form.color === color ? `3px solid ${color}` : "none",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>
      </Field>

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
          Save Project
        </button>
      </div>
    </form>
  );
}

export function Projects({ state, actions }: Props) {
  const { projects, tasks } = state;
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const editProject = editId ? projects.find((p) => p.id === editId) : null;

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [projects, filterStatus, search]);

  function handleAdd(data: ProjectFormData) {
    actions.addProject(data);
    setShowAdd(false);
  }

  function handleEdit(data: ProjectFormData) {
    if (!editId) return;
    actions.updateProject(editId, data);
    setEditId(null);
  }

  function handleDelete() {
    if (!deleteId) return;
    actions.deleteProject(deleteId);
    setDeleteId(null);
  }

  const deleteProject = deleteId ? projects.find((p) => p.id === deleteId) : null;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>Projects</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Project
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        <input
          className="px-3 py-2 rounded-xl text-sm border outline-none flex-1 min-w-40"
          style={{ background: "var(--paper)", color: "var(--ink)", borderColor: "var(--line)" }}
          placeholder="Search projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {(["all","active","paused","completed","archived"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
            style={{
              background: filterStatus === s ? "var(--accent)" : "var(--panel)",
              color: filterStatus === s ? "#fff" : "var(--ink)",
              border: "1px solid var(--line)",
            }}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {/* ── Project Grid ── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No projects yet"
          description="Create your first project to start organising tasks."
          action={{ label: "New Project", onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((proj) => {
            const ptasks = tasks.filter((t) => t.projectId === proj.id);
            const stats = computeProjectStats(ptasks);
            return (
              <ProjectCard
                key={proj.id}
                project={proj}
                stats={stats}
                onViewTasks={() => { actions.setActiveProject(proj.id); actions.setView("tasks"); }}
                onEdit={() => setEditId(proj.id)}
                onDelete={() => setDeleteId(proj.id)}
              />
            );
          })}
        </div>
      )}

      {/* ── Modals ── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Project">
        <ProjectForm initial={DEFAULT_FORM} onSave={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>

      <Modal open={!!editProject} onClose={() => setEditId(null)} title="Edit Project">
        {editProject && (
          <ProjectForm
            initial={{
              name: editProject.name,
              description: editProject.description,
              color: editProject.color,
              icon: editProject.icon,
              status: editProject.status,
            }}
            onSave={handleEdit}
            onCancel={() => setEditId(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteProject}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Delete "${deleteProject?.name}"? All tasks in this project will also be deleted. This cannot be undone.`}
        danger
      />
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  stats,
  onViewTasks,
  onEdit,
  onDelete,
}: {
  project: Project;
  stats: ReturnType<typeof computeProjectStats>;
  onViewTasks: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
    >
      {/* Colour strip */}
      <div className="h-1.5" style={{ background: project.color }} />

      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{project.icon}</span>
            <div>
              <div className="font-bold text-base" style={{ color: "var(--ink)" }}>{project.name}</div>
              <ProjectStatusBadge status={project.status} />
            </div>
          </div>
          <ProgressRing value={stats.completionRate} size={48} strokeWidth={5} color={project.color} />
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs line-clamp-2" style={{ color: "var(--muted)" }}>
            {project.description}
          </p>
        )}

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${stats.completionRate}%`, background: project.color }}
          />
        </div>

        {/* Task counts */}
        <div className="flex gap-4 text-xs" style={{ color: "var(--muted)" }}>
          <span>📋 {stats.total} tasks</span>
          <span>✅ {stats.done} done</span>
          {stats.overdue > 0 && <span style={{ color: "var(--danger)" }}>⚠️ {stats.overdue} overdue</span>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={onViewTasks}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            View Tasks
          </button>
          <button
            onClick={onEdit}
            className="px-3 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ background: "var(--line)", color: "var(--ink)" }}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ background: "var(--danger)", color: "#fff" }}
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}
