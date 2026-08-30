import type { Task, ProjectStats } from "../types";

export function computeProjectStats(tasks: Task[]): ProjectStats {
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const review = tasks.filter((t) => t.status === "review").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const today = new Date().toISOString().slice(0, 10);
  const overdue = tasks.filter(
    (t) => t.dueDate && t.dueDate < today && t.status !== "done"
  ).length;

  return { total, todo, inProgress, review, done, completionRate, overdue };
}

export function getWeeklyCompletions(tasks: Task[]): { day: string; count: number }[] {
  const days: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en", { weekday: "short" });
    const dateStr = d.toISOString().slice(0, 10);
    const count = tasks.filter(
      (t) => t.completedAt && t.completedAt.slice(0, 10) === dateStr
    ).length;
    days.push({ day: label, count });
  }
  return days;
}

export function getPriorityBreakdown(
  tasks: Task[]
): { priority: string; count: number; color: string }[] {
  const map: Record<string, { color: string; count: number }> = {
    critical: { color: "#ef4444", count: 0 },
    high: { color: "#f97316", count: 0 },
    medium: { color: "#f59e0b", count: 0 },
    low: { color: "#22c55e", count: 0 },
  };
  tasks.forEach((t) => {
    if (map[t.priority]) map[t.priority].count++;
  });
  return Object.entries(map).map(([priority, { color, count }]) => ({
    priority,
    count,
    color,
  }));
}
