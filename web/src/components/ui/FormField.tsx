import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
        {label}
        {required && <span style={{ color: "var(--danger)" }}> *</span>}
      </label>
      {children}
      {error && (
        <span className="text-xs" style={{ color: "var(--danger)" }}>
          {error}
        </span>
      )}
    </div>
  );
}

const inputBase =
  "w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-colors focus:ring-2";

const inputStyle = {
  background: "var(--paper)",
  color: "var(--ink)",
  borderColor: "var(--line)",
};

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`${inputBase} ${props.className ?? ""}`}
      style={{ ...inputStyle, ...props.style }}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      className={`${inputBase} resize-none ${props.className ?? ""}`}
      style={{ ...inputStyle, ...props.style }}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${inputBase} cursor-pointer ${props.className ?? ""}`}
      style={{ ...inputStyle, ...props.style }}
    />
  );
}
