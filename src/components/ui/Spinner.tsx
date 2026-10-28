
type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
};

const sizeClasses = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-10 border-[3px]",
} satisfies Record<NonNullable<SpinnerProps["size"]>, string>;

export default function Spinner({ size = "md", label = "טוען" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block shrink-0 animate-spin rounded-full border-current border-t-transparent ${sizeClasses[size]}`}
    />
  );
}