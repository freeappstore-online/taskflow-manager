import { useState } from "react";
import type { AppStore, Tag } from "../../types";
import type { StoreActions } from "../../hooks/useStore";
import { ConfirmDialog } from "../ui/Modal";
import { Field, Input } from "../ui/FormField";

interface Props {
  state: AppStore;
  actions: StoreActions;
}

const TAG_COLOR_PRESETS = [
  "#6366f1","#0ea5e9","#22c55e","#f59e0b","#ec4899","#ef4444",
  "#8b5cf6","#14b8a6","#f97316","#64748b",
];

function TagManager({ tags, actions }: { tags: Tag[]; actions: StoreActions }) {
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(TAG_COLOR_PRESETS[0]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) { setError("Tag name required"); return; }
    if (tags.some((t) => t.label.toLowerCase() === label.trim().toLowerCase())) {
      setError("Tag already exists"); return;
    }
    actions.addTag({ label: label.trim(), color });
    setLabel("");
    setError("");
  }

  const deleteTag = deleteId ? tags.find((t) => t.id === deleteId) : null;

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
    >
      <h2 className="font-bold text-base" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>
        Tags
      </h2>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-40">
          <Field label="New Tag" error={error}>
            <Input
              value={label}
              onChange={(e) => { setLabel(e.target.value); setError(""); }}
              placeholder="e.g. Frontend"
            />
          </Field>
        </div>
        <div>
          <div className="text-sm font-semibold mb-1.5" style={{ color: "var(--ink)" }}>Color</div>
          <div className="flex gap-1.5">
            {TAG_COLOR_PRESETS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full transition-all"
                style={{
                  background: c,
                  outline: color === c ? `3px solid ${c}` : "none",
                  outlineOffset: "2px",
                }}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 self-end"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          Add Tag
        </button>
      </form>

      {/* Tag list */}
      {tags.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>No tags yet. Add one above.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{
                background: tag.color + "22",
                color: tag.color,
                border: `1px solid ${tag.color}44`,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: tag.color }} />
              {tag.label}
              <button
                onClick={() => setDeleteId(tag.id)}
                className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
                title="Delete tag"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTag}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) actions.deleteTag(deleteId); }}
        title="Delete Tag"
        message={`Delete tag "${deleteTag?.label}"? It will be removed from all tasks.`}
        danger
      />
    </div>
  );
}

function DataSection({ actions }: { actions: StoreActions }) {
  const [showReset, setShowReset] = useState(false);

  function handleExport(state: AppStore) {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
    >
      <h2 className="font-bold text-base" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>
        Data Management
      </h2>
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        All your data is stored locally in your browser. Export a backup or reset to the demo data.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            // We need the state — this is called from parent
            actions.resetToSeed(); // placeholder, real export done via prop
          }}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: "var(--panel)", color: "var(--ink)", border: "1px solid var(--line)" }}
          title="Export is handled via the Export button below"
        >
          📤 Export JSON
        </button>
        <button
          onClick={() => setShowReset(true)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: "var(--danger)", color: "#fff" }}
        >
          🔄 Reset to Demo Data
        </button>
      </div>

      <ConfirmDialog
        open={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={() => actions.resetToSeed()}
        title="Reset to Demo Data"
        message="This will delete all your current projects and tasks and restore the demo data. This cannot be undone."
        danger
      />
    </div>
  );
}

export function Settings({ state, actions }: Props) {
  const { tags, projects, tasks } = state;

  function handleExport() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const [showReset, setShowReset] = useState(false);

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Manage tags, data, and app preferences.
        </p>
      </div>

      {/* ── App Info ── */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        <span className="text-4xl">✅</span>
        <div>
          <div className="font-bold text-lg" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>
            TaskFlow
          </div>
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            Production-ready project & task manager · All data stored locally
          </div>
          <div className="flex gap-4 mt-2 text-xs font-semibold" style={{ color: "var(--muted)" }}>
            <span>📁 {projects.length} projects</span>
            <span>✅ {tasks.length} tasks</span>
            <span>🏷 {tags.length} tags</span>
          </div>
        </div>
      </div>

      {/* ── Tags ── */}
      <TagManager tags={tags} actions={actions} />

      {/* ── Data Management ── */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        <h2 className="font-bold text-base" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>
          Data Management
        </h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          All your data is stored locally in your browser using localStorage. Nothing is sent to any server.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--line)", color: "var(--ink)" }}
          >
            📤 Export JSON Backup
          </button>
          <button
            onClick={() => setShowReset(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--danger)", color: "#fff" }}
          >
            🔄 Reset to Demo Data
          </button>
        </div>
      </div>

      {/* ── Keyboard Shortcuts ── */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        <h2 className="font-bold text-base" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>
          Tips & Shortcuts
        </h2>
        <div className="space-y-2 text-sm" style={{ color: "var(--muted)" }}>
          <div className="flex justify-between">
            <span>Close any modal</span>
            <kbd className="px-2 py-0.5 rounded text-xs font-mono" style={{ background: "var(--line)", color: "var(--ink)" }}>Esc</kbd>
          </div>
          <div className="flex justify-between">
            <span>Click a project card → view its tasks</span>
            <span className="text-xs">Dashboard or Projects view</span>
          </div>
          <div className="flex justify-between">
            <span>Drag tasks between columns</span>
            <span className="text-xs">Use → buttons in Kanban</span>
          </div>
          <div className="flex justify-between">
            <span>Switch Kanban ↔ List view</span>
            <span className="text-xs">Toggle in Tasks header</span>
          </div>
        </div>
      </div>

      {/* ── About ── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        <h2 className="font-bold text-base mb-2" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>
          About
        </h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          TaskFlow is a free, offline-first project and task manager built with React 19, TypeScript, Vite 6,
          and Tailwind CSS 4. It uses a clean reducer-based architecture with localStorage persistence.
          No accounts, no tracking, no cloud — your data stays on your device.
        </p>
        <a
          href="https://freeappstore.online"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-sm font-semibold hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Part of FreeAppStore — free forever →
        </a>
      </div>

      <ConfirmDialog
        open={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={() => actions.resetToSeed()}
        title="Reset to Demo Data"
        message="This will delete all your current projects and tasks and restore the sample demo data. This cannot be undone."
        danger
      />
    </div>
  );
}
