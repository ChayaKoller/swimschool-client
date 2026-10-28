import { CircleAlert } from "lucide-react";

type FormErrorProps = {
  message?: string | null;
};

export default function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-control border-[1.5px] border-danger/40 bg-white px-4 py-3 text-sm font-medium text-danger"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}