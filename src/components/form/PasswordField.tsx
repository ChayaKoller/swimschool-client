import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import TextField from "./TextField";

type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, "type">;

export default function PasswordField({ className, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <TextField {...props} type={visible ? "text" : "password"} className={clsx("pe-11", className)} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "הסתרת סיסמה" : "הצגת סיסמה"}
        aria-pressed={visible}
        className="absolute inset-y-0 end-0 grid w-10 place-items-center rounded-e-control text-ink/60 hover:text-primary-text"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}