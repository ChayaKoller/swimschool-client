import Spinner from "./Spinner";

type LoadingStateProps = {
  label?: string;
};

export default function LoadingState({ label = "טוען" }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-primary">
      <Spinner size="lg" label={label} />
      <span aria-hidden="true" className="text-sm text-ink/70">
        {label}...
      </span>
    </div>
  );
}