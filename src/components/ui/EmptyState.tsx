import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border-[1.5px] border-dashed border-ink/30 bg-white px-6 py-12 text-center">
      <Inbox aria-hidden="true" className="mb-1 size-10 text-primary" strokeWidth={1.5} />
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {description && <p className="max-w-sm text-sm text-ink/70">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}