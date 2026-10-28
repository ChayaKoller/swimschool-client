import type { ComponentProps } from "react";
import clsx from "clsx";
import { fieldClasses } from "./fieldClasses";

type TextAreaProps = ComponentProps<"textarea"> & {
  invalid?: boolean;
};

export default function TextArea({ invalid = false, className, rows = 3, ...props }: TextAreaProps) {
  return (
    <textarea
      {...props}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={clsx(fieldClasses, "min-h-20 resize-y py-2 leading-relaxed", className)}
    />
  );
}
