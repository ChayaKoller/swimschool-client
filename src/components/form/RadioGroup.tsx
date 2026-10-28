import type { UseFormRegisterReturn } from "react-hook-form";
import type { Option } from "../../lib/labels";

export type RadioGroupProps = {
  legend: string;
  options: Option[];
  registration: UseFormRegisterReturn;
  error?: string;
};

export default function RadioGroup({ legend, options, registration, error }: RadioGroupProps) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
      <legend className="mb-2 text-sm font-semibold text-ink">{legend}</legend>

      <div className="flex flex-col gap-2 sm:flex-row">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex flex-1 cursor-pointer items-center gap-3 rounded-control border-[1.5px] border-line/25 bg-white px-4 py-3 text-sm font-medium text-line transition select-none hover:border-line has-checked:border-line has-checked:bg-page has-checked:font-semibold has-checked:shadow-hard has-focus-visible:outline-2 has-focus-visible:outline-primary"
          >
            <input
              type="radio"
              value={option.value}
              {...registration}
              className="size-4 shrink-0 cursor-pointer accent-primary focus-visible:outline-none"
            />
            {option.label}
          </label>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}