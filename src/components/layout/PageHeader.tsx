import type { ReactNode } from "react";

export type PageHeaderProps = {
  title: string;
  actions?: ReactNode;
};

export default function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b-[1.5px] border-line pb-4">
      <title>{`${title} · האקווריום`}</title>

      <h1 className="text-3xl font-bold tracking-tight text-line md:text-[34px]">
        <span className="bg-[linear-gradient(transparent_62%,rgb(239_91_149/0.35)_62%)] px-1">{title}</span>
      </h1>

      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
