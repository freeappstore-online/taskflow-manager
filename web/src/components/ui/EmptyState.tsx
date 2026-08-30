interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3
        className="text-xl font-bold mb-2"
        style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}
      >
        {title}
      </h3>
      <p className="text-sm max-w-xs" style={{ color: "var(--muted)" }}>
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
