// ─── Domain Types ────────────────────────────────────────────────────────────

export type Priority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type ProjectStatus = "active" | "paused" | "completed" | "archived";

export interface Tag {
  id: string;
  label: string;
  color: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  tagIds: string[];
  dueDate: string | null; // ISO date string
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Store Shape ─────────────────────────────────────────────────────────────

export interface AppStore {
  projects: Project[];
  tasks: Task[];
  tags: Tag[];
  activeProjectId: string | null;
  activeView: View;
}

export type View = "dashboard" | "projects" | "tasks" | "calendar" | "settings";

// ─── Filter / Sort ───────────────────────────────────────────────────────────

export interface TaskFilters {
  search: string;
  status: TaskStatus | "all";
  priority: Priority | "all";
  tagIds: string[];
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface ProjectStats {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  completionRate: number;
  overdue: number;
}
