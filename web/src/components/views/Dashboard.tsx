import { useMemo } from "react";
import type { AppStore } from "../../types";
import type { StoreActions } from "../../hooks/useStore";
import { selectOverdueTasks, selectUpcomingTasks } from "../../hooks/useStore";
import { computeProjectStats, getWeeklyCompletions, getPriorityBreakdown } from "../../lib/analytics";
import { ProgressRing } from "../ui/ProgressRing";
import { PriorityBadge, StatusBadge } from "../ui/Badge";

interface Props {
  state: AppStore;
  actions: StoreActions;
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-1"
      style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
    >
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <span className="text-3xl font-bold" style={{ color: accent ?? "var(--ink)", fontFamily: "Fraunces, serif" }}>
        {value}
      </span>
      {sub && <span className="text-xs" style={{ color: "var(--muted)" }}>{sub}</span>}
    </div>
  );
}

export function Dashboard({ state, actions }: Props) {
  const { tasks, projects, tags } = state;

  const globalStats = useMemo(() => computeProjectStats(tasks), [tasks]);
  const overdue = useMemo(() => selectOverdueTasks(tasks), [tasks]);
  const upcoming = useMemo(() => selectUpcomingTasks(tasks, 7), [tasks]);
  const weekly = useMemo(() => getWeeklyCompletions(tasks), [tasks]);
  const priorityBreakdown = useMemo(() => getPriorityBreakdown(tasks.filter(t => t.status !== "done")), [tasks]);

  const maxWeekly = Math.max(...weekly.map((w) => w.count), 1);
  const activeProjects = projects.filter((p) => p.status === "active");

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={globalStats.total} />
        <StatCard label="In Progress" value={globalStats.inProgress} accent="var(--accent)" />
        <StatCard label="Completed" value={globalStats.done} accent="var(--success)" />
        <StatCard label="Overdue" value={globalStats.overdue} accent={globalStats.overdue > 0 ? "var(--danger)" : "var(--ink)"} />
      </div>

      {/* ── Project Health ── */}
      {activeProjects.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Fraunces, serif" }}>
            Active Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.map((proj) => {
              const ptasks = tasks.filter((t) => t.projectId === proj.id);
              const stats = computeProjectStats(ptasks);
              return (
                <button
                  key={proj.id}
                  onClick={() => { actions.setActiveProject(proj.id); actions.setView("tasks"); }}
                  className="rounded-2xl p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{proj.icon}</span>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
                          {proj.name}
                        </div>
                        <div className="text-xs" style={{ color: "var(--muted)" }}>
                          {stats.total} tasks
                        </div>
                      </div>
                    </div>
                    <ProgressRing value={stats.completionRate} size={52} strokeWidth={5} color={proj.color} />
                  </div>
                  {/* Mini progress bar */}
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${stats.completionRate}%`, background: proj.color }}
                    />
                  </div>
                  <div className="flex gap-3 mt-3 text-xs" style={{ color: "var(--muted)" }}>
                    <span>✅ {stats.done} done</span>
                    <span>🔄 {stats.inProgress} active</span>
                    {stats.overdue > 0 && <span style={{ color: "var(--danger)" }}>⚠️ {stats.overdue} overdue</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Weekly Activity + Priority Breakdown ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly completions bar chart */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        >
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--ink)" }}>
            Completions — Last 7 Days
          </h3>
          <div className="flex items-end gap-2 h-24">
            {weekly.map((w) => (
              <div key={w.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold" style={{ color: "var(--muted)" }}>
                  {w.count > 0 ? w.count : ""}
                </span>
                <div className="w-full rounded-t-md transition-all" style={{
                  height: `${Math.max((w.count / maxWeekly) * 80, w.count > 0 ? 8 : 4)}px`,
                  background: w.count > 0 ? "var(--accent)" : "var(--line)",
                }} />
                <span className="text-[10px]" style={{ color: "var(--muted)" }}>{w.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority breakdown */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        >
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--ink)" }}>
            Open Tasks by Priority
          </h3>
          <div className="space-y-3">
            {priorityBreakdown.map((p) => {
              const openTotal = tasks.filter((t) => t.status !== "done").length;
              const pct = openTotal > 0 ? Math.round((p.count / openTotal) * 100) : 0;
              return (
                <div key={p.priority} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-semibold capitalize" style={{ color: "var(--ink)" }}>
                    {p.priority}
                  </span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: p.color }}
                    />
                  </div>
                  <span className="w-6 text-xs text-right font-bold" style={{ color: "var(--muted)" }}>
                    {p.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Overdue + Upcoming ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overdue */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        >
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--danger)" }}>
            <span>⚠️</span> Overdue ({overdue.length})
          </h3>
          {overdue.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>All caught up! 🎉</p>
          ) : (
            <ul className="space-y-2">
              {overdue.slice(0, 5).map((t) => {
                const proj = projects.find((p) => p.id === t.projectId);
                return (
                  <li key={t.id} className="flex items-start gap-2">
                    <span className="mt-0.5 text-base">{proj?.icon ?? "📁"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>{t.title}</div>
                      <div className="text-xs" style={{ color: "var(--danger)" }}>
                        Due {t.dueDate}
                      </div>
                    </div>
                    <PriorityBadge priority={t.priority} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Upcoming */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        >
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--ink)" }}>
            <span>📅</span> Due This Week ({upcoming.length})
          </h3>
          {upcoming.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>Nothing due in the next 7 days.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.slice(0, 5).map((t) => {
                const proj = projects.find((p) => p.id === t.projectId);
                return (
                  <li key={t.id} className="flex items-start gap-2">
                    <span className="mt-0.5 text-base">{proj?.icon ?? "📁"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>{t.title}</div>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        Due {t.dueDate}
                      </div>
                    </div>
                    <StatusBadge status={t.status} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Tags overview */}
      {tags.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        >
          <h3 className="font-bold text-sm mb-3" style={{ color: "var(--ink)" }}>Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const count = tasks.filter((t) => t.tagIds.includes(tag.id)).length;
              return (
                <span
                  key={tag.id}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: tag.color + "22", color: tag.color, border: `1px solid ${tag.color}44` }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: tag.color }}
                  />
                  {tag.label}
                  <span className="opacity-60">({count})</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
