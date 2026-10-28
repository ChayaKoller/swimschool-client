import type { ComponentProps } from "react";
import clsx from "clsx";
import { fieldClasses } from "./fieldClasses";

type SelectFieldProps = ComponentProps<"select"> & {
  options: { value: string; label: string }[];
  placeholder?: string;
  invalid?: boolean;
};

export default function SelectField({ options, placeholder, invalid = false, className, ...props }: SelectFieldProps) {
  return (
    <select {...props} aria-invalid={invalid || undefined} className={clsx(fieldClasses, "h-10 cursor-pointer", className)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}