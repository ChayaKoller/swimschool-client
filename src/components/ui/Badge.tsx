import type { ReactNode } from "react";

type BadgeProps = {
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
  children: ReactNode;
};

const toneClasses = {
  success: "border-success/40 bg-success/10 text-success",
  warning: "border-coral/50 bg-coral/10 text-[#b84a33]",
  danger: "border-danger/40 bg-danger/10 text-danger",
  info: "border-primary/40 bg-primary/10 text-primary-text",
  neutral: "border-ink/25 bg-ink/5 text-ink",
} satisfies Record<NonNullable<BadgeProps["tone"]>, string>;

export default function Badge({ tone = "neutral", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}