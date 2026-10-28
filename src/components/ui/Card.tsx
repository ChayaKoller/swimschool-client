import type { ReactNode } from "react";
import clsx from "clsx";

type CardProps = {
  title?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export default function Card({ title, actions, children, className }: CardProps) {
  const hasHeader = Boolean(title || actions);

  return (
    <section className={clsx("rounded-card border-[1.5px] border-line bg-white", className)}>
      {hasHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-line px-5 py-3">
          {title && <h2 className="text-base font-bold text-ink">{title}</h2>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}