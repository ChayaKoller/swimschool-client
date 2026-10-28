import type { ComponentProps } from "react";
import clsx from "clsx";
import { fieldClasses } from "./fieldClasses";

type TextFieldProps = ComponentProps<"input"> & {
  invalid?: boolean;
};

export default function TextField({ invalid = false, className, ...props }: TextFieldProps) {
  return <input {...props} aria-invalid={invalid || undefined} className={clsx(fieldClasses, "h-10", className)} />;
}