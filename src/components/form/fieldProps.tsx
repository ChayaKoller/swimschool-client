import { get, type FieldErrors, type FieldValues, type Path, type RegisterOptions, type UseFormRegister } from "react-hook-form";

export function createFieldProps<T extends FieldValues>(register: UseFormRegister<T>, errors: FieldErrors<T>) {
  return <N extends Path<T>>(name: N, options?: RegisterOptions<T, N>) => ({
    id: name,
    "aria-describedby": `${name}-description`,
    invalid: Boolean(get(errors, name)),
    ...register(name, options),
  });
}