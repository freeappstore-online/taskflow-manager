/**
 * TaskFlow — Production-ready Project & Task Manager
 *
 * Architecture:
 *  - useStore() → centralised reducer (Redux-like) with auto-persist to localStorage
 *  - Shell      → responsive layout (desktop sidebar + mobile bottom dock)
 *  - Views      → Dashboard | Projects | Tasks (Kanban + List) | Calendar | Settings
 *  - UI atoms   → Badge, Modal, ProgressRing, EmptyState, FormField
 *  - Zero external deps beyond React + Tailwind
 */
import { Shell } from "./components/Shell";
import { useStore } from "./hooks/useStore";
import { Dashboard } from "./components/views/Dashboard";
import { Projects } from "./components/views/Projects";
import { Tasks } from "./components/views/Tasks";
import { Calendar } from "./components/views/Calendar";
import { Settings } from "./components/views/Settings";
import type { View } from "./types";

export default function App() {
  const store = useStore();
  const { state, setView } = store;

  function renderView() {
    switch (state.activeView) {
      case "dashboard":
        return <Dashboard state={state} actions={store} />;
      case "projects":
        return <Projects state={state} actions={store} />;
      case "tasks":
        return <Tasks state={state} actions={store} />;
      case "calendar":
        return <Calendar state={state} actions={store} />;
      case "settings":
        return <Settings state={state} actions={store} />;
      default:
        return <Dashboard state={state} actions={store} />;
    }
  }

  return (
    <Shell
      activeView={state.activeView}
      onNavigate={(v: View) => setView(v)}
      appTitle="TaskFlow"
    >
      {renderView()}
    </Shell>
  );
}
