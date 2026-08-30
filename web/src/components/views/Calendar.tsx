import { useState, useMemo } from "react";
import type { AppStore, Task } from "../../types";
import type { StoreActions } from "../../hooks/useStore";
import { PriorityBadge } from "../ui/Badge";

interface Props {
  state: AppStore;
  actions: StoreActions;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function Calendar({ state, actions }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { tasks, projects } = state;

  // Tasks indexed by due date
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      if (t.dueDate) {
        if (!map[t.dueDate]) map[t.dueDate] = [];
        map[t.dueDate].push(t);
      }
    });
    return map;
  }, [tasks]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = today.toISOString().slice(0, 10);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function formatDate(y: number, m: number, d: number): string {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] ?? []) : [];

  // Build calendar grid
  const cells: Array<{ date: string; day: number } | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: formatDate(viewYear, viewMonth, d), day: d });
  }
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
          Calendar
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="font-bold text-base min-w-36 text-center" style={{ color: "var(--ink)" }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <button
            onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDate(todayStr); }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Calendar Grid ── */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--line)", background: "var(--panel)" }}
        >
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--line)" }}>
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--muted)" }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              if (!cell) {
                return (
                  <div
                    key={`empty-${i}`}
                    className="h-20 border-b border-r"
                    style={{ borderColor: "var(--line)", background: "var(--paper)", opacity: 0.3 }}
                  />
                );
              }

              const { date, day } = cell;
              const dayTasks = tasksByDate[date] ?? [];
              const isToday = date === todayStr;
              const isSelected = date === selectedDate;
              const isPast = date < todayStr;

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date === selectedDate ? null : date)}
                  className="h-20 border-b border-r p-1.5 text-left transition-colors flex flex-col"
                  style={{
                    borderColor: "var(--line)",
                    background: isSelected
                      ? "var(--accent)"
                      : isToday
                      ? "var(--accent)" + "18"
                      : "var(--paper)",
                  }}
                >
                  <span
                    className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday && !isSelected ? "text-white" : ""
                    }`}
                    style={{
                      color: isSelected ? "#fff" : isPast && !isToday ? "var(--muted)" : "var(--ink)",
                      background: isToday && !isSelected ? "var(--accent)" : "transparent",
                    }}
                  >
                    {day}
                  </span>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => {
                      const proj = projects.find((p) => p.id === t.projectId);
                      return (
                        <div
                          key={t.id}
                          className="text-[9px] px-1 py-0.5 rounded font-semibold truncate"
                          style={{
                            background: isSelected ? "rgba(255,255,255,0.25)" : (proj?.color ?? "var(--accent)") + "33",
                            color: isSelected ? "#fff" : proj?.color ?? "var(--accent)",
                          }}
                        >
                          {t.title}
                        </div>
                      );
                    })}
                    {dayTasks.length > 2 && (
                      <div
                        className="text-[9px] px-1 font-bold"
                        style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "var(--muted)" }}
                      >
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Day Detail Panel ── */}
        <div
          className="rounded-2xl p-5 flex flex-col"
          style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        >
          {selectedDate ? (
            <>
              <h3 className="font-bold mb-4" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("en", {
                  weekday: "long", month: "long", day: "numeric",
                })}
              </h3>
              {selectedTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <span className="text-3xl mb-2">🗓️</span>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    No tasks due on this day.
                  </p>
                  <button
                    onClick={() => { actions.setView("tasks"); }}
                    className="mt-3 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    Add Task
                  </button>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto flex-1">
                  {selectedTasks.map((t) => {
                    const proj = projects.find((p) => p.id === t.projectId);
                    return (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl flex flex-col gap-1.5"
                        style={{
                          background: "var(--paper)",
                          border: "1px solid var(--line)",
                          borderLeft: `3px solid ${proj?.color ?? "var(--accent)"}`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className="text-sm font-semibold"
                            style={{
                              color: "var(--ink)",
                              textDecoration: t.status === "done" ? "line-through" : "none",
                            }}
                          >
                            {t.title}
                          </span>
                          <PriorityBadge priority={t.priority} />
                        </div>
                        {proj && (
                          <span className="text-xs" style={{ color: "var(--muted)" }}>
                            {proj.icon} {proj.name}
                          </span>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (t.status === "done") actions.reopenTask(t.id);
                              else actions.completeTask(t.id);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                            style={{
                              background: t.status === "done" ? "var(--line)" : "var(--success)",
                              color: t.status === "done" ? "var(--ink)" : "#fff",
                            }}
                          >
                            {t.status === "done" ? "Reopen" : "✓ Done"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <span className="text-4xl mb-3">📅</span>
              <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>Select a day</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Click any date to see tasks due that day.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Month summary ── */}
      <div
        className="rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        {(() => {
          const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
          const monthTasks = tasks.filter((t) => t.dueDate?.startsWith(monthStr));
          const done = monthTasks.filter((t) => t.status === "done").length;
          const overdue = monthTasks.filter((t) => t.dueDate && t.dueDate < todayStr && t.status !== "done").length;
          const upcoming = monthTasks.filter((t) => t.dueDate && t.dueDate >= todayStr && t.status !== "done").length;

          return (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>{monthTasks.length}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>Tasks this month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif", color: "var(--success)" }}>{done}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif", color: "var(--accent)" }}>{upcoming}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif", color: overdue > 0 ? "var(--danger)" : "var(--ink)" }}>{overdue}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>Overdue</div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
