import type { AppStore, Project, Task, Tag } from "../types";
import { generateId } from "./id";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function buildSeedStore(): AppStore {
  const tags: Tag[] = [
    { id: "t1", label: "Frontend", color: "#6366f1" },
    { id: "t2", label: "Backend", color: "#0ea5e9" },
    { id: "t3", label: "Design", color: "#ec4899" },
    { id: "t4", label: "Bug", color: "#ef4444" },
    { id: "t5", label: "Feature", color: "#22c55e" },
    { id: "t6", label: "Docs", color: "#f59e0b" },
  ];

  const p1 = generateId();
  const p2 = generateId();
  const p3 = generateId();

  const projects: Project[] = [
    {
      id: p1,
      name: "Website Redesign",
      description: "Complete overhaul of the marketing site with new brand guidelines.",
      color: "#6366f1",
      icon: "🌐",
      status: "active",
      createdAt: daysAgo(30),
      updatedAt: daysAgo(2),
    },
    {
      id: p2,
      name: "Mobile App v2",
      description: "Cross-platform mobile app with offline-first architecture.",
      color: "#0ea5e9",
      icon: "📱",
      status: "active",
      createdAt: daysAgo(20),
      updatedAt: daysAgo(1),
    },
    {
      id: p3,
      name: "API Platform",
      description: "RESTful API gateway with auth, rate-limiting, and docs.",
      color: "#22c55e",
      icon: "⚡",
      status: "paused",
      createdAt: daysAgo(60),
      updatedAt: daysAgo(10),
    },
  ];

  const tasks: Task[] = [
    // Website Redesign
    {
      id: generateId(), projectId: p1, title: "Audit current site content",
      description: "Catalogue all pages, assets, and copy for the redesign sprint.",
      status: "done", priority: "high", tagIds: ["t3", "t6"],
      dueDate: daysFromNow(-5), createdAt: daysAgo(28), updatedAt: daysAgo(5),
      completedAt: daysAgo(5),
    },
    {
      id: generateId(), projectId: p1, title: "Create new design system",
      description: "Define tokens, components, and motion guidelines in Figma.",
      status: "in_progress", priority: "critical", tagIds: ["t1", "t3"],
      dueDate: daysFromNow(3), createdAt: daysAgo(20), updatedAt: daysAgo(1),
      completedAt: null,
    },
    {
      id: generateId(), projectId: p1, title: "Implement hero section",
      description: "Build responsive hero with animation and CTA buttons.",
      status: "todo", priority: "high", tagIds: ["t1"],
      dueDate: daysFromNow(7), createdAt: daysAgo(15), updatedAt: daysAgo(3),
      completedAt: null,
    },
    {
      id: generateId(), projectId: p1, title: "SEO meta tags audit",
      description: "Review and update all meta descriptions, OG tags, and sitemaps.",
      status: "todo", priority: "medium", tagIds: ["t6"],
      dueDate: daysFromNow(14), createdAt: daysAgo(10), updatedAt: daysAgo(2),
      completedAt: null,
    },
    {
      id: generateId(), projectId: p1, title: "Performance optimisation",
      description: "Achieve Lighthouse score > 95 across all pages.",
      status: "todo", priority: "medium", tagIds: ["t1", "t2"],
      dueDate: daysFromNow(21), createdAt: daysAgo(8), updatedAt: daysAgo(1),
      completedAt: null,
    },

    // Mobile App v2
    {
      id: generateId(), projectId: p2, title: "Auth flow — sign in / sign up",
      description: "Implement JWT auth with biometric fallback.",
      status: "done", priority: "critical", tagIds: ["t2", "t5"],
      dueDate: daysFromNow(-3), createdAt: daysAgo(18), updatedAt: daysAgo(3),
      completedAt: daysAgo(3),
    },
    {
      id: generateId(), projectId: p2, title: "Offline sync engine",
      description: "CRDTs for conflict-free offline-first data sync.",
      status: "in_progress", priority: "critical", tagIds: ["t2"],
      dueDate: daysFromNow(5), createdAt: daysAgo(14), updatedAt: daysAgo(1),
      completedAt: null,
    },
    {
      id: generateId(), projectId: p2, title: "Push notifications",
      description: "FCM integration with per-user preference controls.",
      status: "review", priority: "high", tagIds: ["t2", "t5"],
      dueDate: daysFromNow(2), createdAt: daysAgo(10), updatedAt: daysAgo(1),
      completedAt: null,
    },
    {
      id: generateId(), projectId: p2, title: "Dark mode polish",
      description: "Audit every screen for dark-mode edge cases.",
      status: "todo", priority: "low", tagIds: ["t1", "t3"],
      dueDate: daysFromNow(10), createdAt: daysAgo(7), updatedAt: daysAgo(2),
      completedAt: null,
    },
    {
      id: generateId(), projectId: p2, title: "Fix crash on profile screen",
      description: "NPE when avatar URL is null — add null guard.",
      status: "in_progress", priority: "critical", tagIds: ["t4"],
      dueDate: daysFromNow(1), createdAt: daysAgo(2), updatedAt: daysAgo(0),
      completedAt: null,
    },

    // API Platform
    {
      id: generateId(), projectId: p3, title: "Rate limiting middleware",
      description: "Token-bucket algorithm with Redis backing.",
      status: "done", priority: "high", tagIds: ["t2"],
      dueDate: daysFromNow(-10), createdAt: daysAgo(55), updatedAt: daysAgo(12),
      completedAt: daysAgo(12),
    },
    {
      id: generateId(), projectId: p3, title: "OpenAPI spec v3",
      description: "Write full OpenAPI 3.1 spec and generate SDK stubs.",
      status: "todo", priority: "medium", tagIds: ["t6"],
      dueDate: daysFromNow(30), createdAt: daysAgo(40), updatedAt: daysAgo(10),
      completedAt: null,
    },
  ];

  return {
    projects,
    tasks,
    tags,
    activeProjectId: null,
    activeView: "dashboard",
  };
}
