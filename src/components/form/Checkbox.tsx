import type { ComponentProps } from "react";
import clsx from "clsx";

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label: string;
};

export default function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label
      className={clsx(
        "inline-flex cursor-pointer items-center gap-2 text-sm text-line select-none has-disabled:cursor-not-allowed has-disabled:opacity-60",
        className,
      )}
    >
      <input {...props} type="checkbox" className="size-4 shrink-0 cursor-pointer accent-primary" />
      {label}
    </label>
  );
}