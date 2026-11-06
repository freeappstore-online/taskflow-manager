/**
 * useStore — centralised state management (reducer pattern, no external deps).
 * All mutations go through dispatch(); persistence is automatic via useEffect.
 */
import { useReducer, useEffect, useCallback } from "react";
import type {
  AppStore,
  Project,
  Task,
  Tag,
  View,
  Priority,
  TaskStatus,
  ProjectStatus,
} from "../types";
import { loadStore, saveStore } from "../lib/storage";
import { buildSeedStore } from "../lib/seed";
import { generateId, now } from "../lib/id";

// ─── Action Definitions ───────────────────────────────────────────────────────

type Action =
  | { type: "SET_VIEW"; view: View }
  | { type: "SET_ACTIVE_PROJECT"; id: string | null }
  // Projects
  | { type: "ADD_PROJECT"; payload: Omit<Project, "id" | "createdAt" | "updatedAt"> }
  | { type: "UPDATE_PROJECT"; id: string; patch: Partial<Omit<Project, "id" | "createdAt">> }
  | { type: "DELETE_PROJECT"; id: string }
  // Tasks
  | { type: "ADD_TASK"; payload: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt"> }
  | { type: "UPDATE_TASK"; id: string; patch: Partial<Omit<Task, "id" | "createdAt">> }
  | { type: "DELETE_TASK"; id: string }
  | { type: "COMPLETE_TASK"; id: string }
  | { type: "REOPEN_TASK"; id: string }
  | { type: "MOVE_TASK_STATUS"; id: string; status: TaskStatus }
  // Tags
  | { type: "ADD_TAG"; payload: Omit<Tag, "id"> }
  | { type: "DELETE_TAG"; id: string }
  // Meta
  | { type: "RESET_TO_SEED" };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: AppStore, action: Action): AppStore {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, activeView: action.view };

    case "SET_ACTIVE_PROJECT":
      return { ...state, activeProjectId: action.id };

    // ── Projects ──────────────────────────────────────────────────────────────
    case "ADD_PROJECT": {
      const project: Project = {
        ...action.payload,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
      };
      return { ...state, projects: [...state.projects, project] };
    }
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.id ? { ...p, ...action.patch, updatedAt: now() } : p
        ),
      };
    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.id),
        tasks: state.tasks.filter((t) => t.projectId !== action.id),
        activeProjectId:
          state.activeProjectId === action.id ? null : state.activeProjectId,
      };

    // ── Tasks ─────────────────────────────────────────────────────────────────
    case "ADD_TASK": {
      const task: Task = {
        ...action.payload,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
        completedAt: null,
      };
      return { ...state, tasks: [...state.tasks, task] };
    }
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, ...action.patch, updatedAt: now() } : t
        ),
      };
    case "DELETE_TASK":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };

    case "COMPLETE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id
            ? { ...t, status: "done", completedAt: now(), updatedAt: now() }
            : t
        ),
      };
    case "REOPEN_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id
            ? { ...t, status: "todo", completedAt: null, updatedAt: now() }
            : t
        ),
      };
    case "MOVE_TASK_STATUS":
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== action.id) return t;
          const completedAt =
            action.status === "done" ? now() : t.status === "done" ? null : t.completedAt;
          return { ...t, status: action.status, completedAt, updatedAt: now() };
        }),
      };

    // ── Tags ──────────────────────────────────────────────────────────────────
    case "ADD_TAG": {
      const tag: Tag = { ...action.payload, id: generateId() };
      return { ...state, tags: [...state.tags, tag] };
    }
    case "DELETE_TAG":
      return {
        ...state,
        tags: state.tags.filter((t) => t.id !== action.id),
        tasks: state.tasks.map((t) => ({
          ...t,
          tagIds: t.tagIds.filter((tid) => tid !== action.id),
        })),
      };

    case "RESET_TO_SEED":
      return buildSeedStore();

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function getInitialStore(): AppStore {
  const persisted = loadStore();
  if (persisted) return persisted;
  return buildSeedStore();
}

export function useStore() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialStore);

  // Auto-persist on every state change
  useEffect(() => {
    saveStore(state);
  }, [state]);

  // ── Convenience action creators ──────────────────────────────────────────────
  const setView = useCallback((view: View) => dispatch({ type: "SET_VIEW", view }), []);
  const setActiveProject = useCallback(
    (id: string | null) => dispatch({ type: "SET_ACTIVE_PROJECT", id }),
    []
  );

  const addProject = useCallback(
    (payload: { name: string; description: string; color: string; icon: string; status: ProjectStatus }) =>
      dispatch({ type: "ADD_PROJECT", payload }),
    []
  );
  const updateProject = useCallback(
    (id: string, patch: Partial<Omit<Project, "id" | "createdAt">>) =>
      dispatch({ type: "UPDATE_PROJECT", id, patch }),
    []
  );
  const deleteProject = useCallback(
    (id: string) => dispatch({ type: "DELETE_PROJECT", id }),
    []
  );

  const addTask = useCallback(
    (payload: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt">) =>
      dispatch({ type: "ADD_TASK", payload }),
    []
  );
  const updateTask = useCallback(
    (id: string, patch: Partial<Omit<Task, "id" | "createdAt">>) =>
      dispatch({ type: "UPDATE_TASK", id, patch }),
    []
  );
  const deleteTask = useCallback(
    (id: string) => dispatch({ type: "DELETE_TASK", id }),
    []
  );
  const completeTask = useCallback(
    (id: string) => dispatch({ type: "COMPLETE_TASK", id }),
    []
  );
  const reopenTask = useCallback(
    (id: string) => dispatch({ type: "REOPEN_TASK", id }),
    []
  );
  const moveTaskStatus = useCallback(
    (id: string, status: TaskStatus) => dispatch({ type: "MOVE_TASK_STATUS", id, status }),
    []
  );

  const addTag = useCallback(
    (payload: Omit<Tag, "id">) => dispatch({ type: "ADD_TAG", payload }),
    []
  );
  const deleteTag = useCallback(
    (id: string) => dispatch({ type: "DELETE_TAG", id }),
    []
  );

  const resetToSeed = useCallback(() => dispatch({ type: "RESET_TO_SEED" }), []);

  return {
    state,
    dispatch,
    // actions
    setView,
    setActiveProject,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    reopenTask,
    moveTaskStatus,
    addTag,
    deleteTag,
    resetToSeed,
  };
}

export type StoreActions = ReturnType<typeof useStore>;

// ─── Derived selectors (pure functions, no hooks needed) ──────────────────────

export function selectProjectTasks(tasks: Task[], projectId: string): Task[] {
  return tasks.filter((t) => t.projectId === projectId);
}

export function selectOverdueTasks(tasks: Task[]): Task[] {
  const today = new Date().toISOString().slice(0, 10);
  return tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== "done");
}

export function selectUpcomingTasks(tasks: Task[], days = 7): Task[] {
  const today = new Date().toISOString().slice(0, 10);
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  const limitStr = limit.toISOString().slice(0, 10);
  return tasks.filter(
    (t) => t.dueDate && t.dueDate >= today && t.dueDate <= limitStr && t.status !== "done"
  );
}

export function filterTasks(
  tasks: Task[],
  filters: { search: string; status: string; priority: string; tagIds: string[] }
): Task[] {
  return tasks.filter((t) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q))
        return false;
    }
    if (filters.status !== "all" && t.status !== filters.status) return false;
    if (filters.priority !== "all" && t.priority !== filters.priority) return false;
    if (filters.tagIds.length > 0 && !filters.tagIds.some((tid) => t.tagIds.includes(tid)))
      return false;
    return true;
  });
}

// Unused imports guard
type _PriorityGuard = Priority;
type _StatusGuard = TaskStatus;
