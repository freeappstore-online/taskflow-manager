import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  color?: string;
  bg?: string;
  size?: "sm" | "md";
}

export function Badge({ children, color, bg, size = "sm" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      }`}
      style={{
        color: color ?? "#fff",
        background: bg ?? "var(--accent)",
      }}
    >
      {children}
    </span>
  );
}

// ─── Priority Badge ────────────────────────────────────────────────────────────

const PRIORITY_META: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "#fff", bg: "#dc2626" },
  high:     { label: "High",     color: "#fff", bg: "#ea580c" },
  medium:   { label: "Medium",   color: "#fff", bg: "#d97706" },
  low:      { label: "Low",      color: "#fff", bg: "#16a34a" },
};

export function PriorityBadge({ priority }: { priority: string }) {
  const meta = PRIORITY_META[priority] ?? PRIORITY_META.low;
  return <Badge color={meta.color} bg={meta.bg}>{meta.label}</Badge>;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  todo:        { label: "To Do",       color: "var(--ink)", bg: "var(--line)" },
  in_progress: { label: "In Progress", color: "#fff",       bg: "#2563eb" },
  review:      { label: "Review",      color: "#fff",       bg: "#7c3aed" },
  done:        { label: "Done",        color: "#fff",       bg: "#16a34a" },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.todo;
  return <Badge color={meta.color} bg={meta.bg}>{meta.label}</Badge>;
}

// ─── Project Status Badge ─────────────────────────────────────────────────────

const PROJ_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: "Active",    color: "#fff",       bg: "#16a34a" },
  paused:    { label: "Paused",    color: "#fff",       bg: "#d97706" },
  completed: { label: "Completed", color: "#fff",       bg: "#2563eb" },
  archived:  { label: "Archived",  color: "var(--ink)", bg: "var(--line)" },
};

export function ProjectStatusBadge({ status }: { status: string }) {
  const meta = PROJ_STATUS_META[status] ?? PROJ_STATUS_META.active;
  return <Badge color={meta.color} bg={meta.bg}>{meta.label}</Badge>;
}
