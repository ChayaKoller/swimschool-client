import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import Spinner from "./Spinner";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
  icon?: ReactNode;
};

const variantClasses = {
  primary: "border-line bg-pink text-line shadow-hard hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
  secondary: "border-line bg-white text-line shadow-hard hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
  danger: "border-danger bg-danger text-white hover:bg-danger/90",
  ghost: "border-transparent bg-transparent text-primary-text hover:bg-primary/10",
} satisfies Record<NonNullable<ButtonProps["variant"]>, string>;

export default function Button({
  variant = "primary",
  isLoading = false,
  icon,
  children,
  disabled,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={clsx(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border-[1.5px] px-5 text-sm font-semibold whitespace-nowrap transition",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        variantClasses[variant],
        className,
      )}
    >
      {isLoading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  );
}