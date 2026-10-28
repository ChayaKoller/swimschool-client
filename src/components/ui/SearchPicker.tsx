import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { Search } from "lucide-react";
import FormField from "../form/FormField";
import TextField from "../form/TextField";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";

export type SearchPickerProps<T> = {
  name: string;
  label: string;
  placeholder: string;
  query: string;
  onQueryChange: (value: string) => void;
  items: T[];
  getKey: (item: T) => number;
  renderItem: (item: T) => ReactNode;
  isDisabled?: (item: T) => boolean;
  isLoading: boolean;
  error?: unknown;
  emptyText: string;
  onPick?: (item: T) => void;
};

export default function SearchPicker<T>({
  name,
  label,
  placeholder,
  query,
  onQueryChange,
  items,
  getKey,
  renderItem,
  isDisabled,
  isLoading,
  error,
  emptyText,
  onPick,
}: SearchPickerProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const registration = register(name);
  const searchId = `${name}-search`;
  const fieldError = errors[name]?.message?.toString();

  let content: ReactNode;
  if (isLoading) {
    content = <LoadingState label="טוען רשימה" />;
  } else if (error) {
    content = <ErrorState error={error} />;
  } else if (items.length === 0) {
    content = <EmptyState title={emptyText} />;
  } else {
    content = (
      <ul aria-label={label} className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={getKey(item)}>
            <label className="flex cursor-pointer items-center gap-3 rounded-control border-[1.5px] border-transparent px-3 py-2.5 text-sm text-line transition select-none hover:bg-page has-checked:border-line has-checked:bg-page has-checked:shadow-hard has-focus-visible:outline-2 has-focus-visible:outline-primary has-disabled:cursor-not-allowed has-disabled:opacity-50 has-disabled:hover:bg-transparent">
              <input
                type="radio"
                {...registration}
                value={getKey(item)}
                disabled={isDisabled?.(item)}
                onChange={(event) => {
                  registration.onChange(event);
                  onPick?.(item);
                }}
                className="size-4 shrink-0 cursor-pointer accent-primary focus-visible:outline-none disabled:cursor-not-allowed"
              />
              <div className="min-w-0 flex-1">{renderItem(item)}</div>
            </label>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <FormField label={label} htmlFor={searchId} error={fieldError}>
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-ink/40" />
          <TextField
            id={searchId}
            type="search"
            autoComplete="off"
            aria-describedby={`${searchId}-description`}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            className="ps-9"
          />
        </div>

        <div className="max-h-72 overflow-y-auto rounded-control border-[1.5px] border-line/25 bg-white p-1.5">
          {content}
        </div>
      </div>
    </FormField>
  );
}