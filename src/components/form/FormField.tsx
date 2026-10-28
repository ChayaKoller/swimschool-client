import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
};

export default function FormField({ label, htmlFor, children, error, hint, required = false }: FormFieldProps) {
  const descriptionId = `${htmlFor}-description`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
        {label}
        {required && (
          <span aria-hidden="true" className="ms-0.5 text-pink">
            *
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p id={descriptionId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={descriptionId} className="text-xs text-ink/60">
          {hint}
        </p>
      ) : null}
    </div>
  );
}