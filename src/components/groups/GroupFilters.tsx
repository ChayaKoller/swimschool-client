import { Search, X } from "lucide-react";
import type { GroupFilterValues } from "../../api/groups/schema";
import { seasonLabels, toOptions } from "../../lib/labels";
import type { Option } from "../../lib/labels";
import SelectField from "../form/SelectField";
import TextField from "../form/TextField";
import Button from "../ui/Button";

export type GroupFiltersProps = {
  values: GroupFilterValues;
  onChange: (key: keyof GroupFilterValues, value: string) => void;
  onClear: () => void;
  hasFilters: boolean;
};

const SEASON_OPTIONS = toOptions(seasonLabels);

const STATUS_OPTIONS: Option[] = [
  { value: "active", label: "פעילות" },
  { value: "inactive", label: "לא פעילות" },
  { value: "all", label: "הכל" },
];

function yearOptions(): Option[] {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + 1 - i);
  return [
    { value: "all", label: "כל השנים" },
    ...years.map((year) => ({ value: String(year), label: String(year) })),
  ];
}

export default function GroupFilters({ values, onChange, onClear, hasFilters }: GroupFiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-card border-[1.5px] border-line bg-white p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink/50" />
        <TextField
          aria-label="חיפוש לפי שם"
          type="search"
          placeholder="חיפוש לפי שם"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          className="ps-9"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 lg:flex lg:gap-3">
        <SelectField
          aria-label="סינון לפי עונה"
          placeholder="כל העונות"
          options={SEASON_OPTIONS}
          value={values.season}
          onChange={(e) => onChange("season", e.target.value)}
          className="lg:w-36"
        />
        <SelectField
          aria-label="סינון לפי שנה"
          options={yearOptions()}
          value={values.year}
          onChange={(e) => onChange("year", e.target.value)}
          className="lg:w-32"
        />
        <SelectField
          aria-label="סינון לפי מצב"
          options={STATUS_OPTIONS}
          value={values.status}
          onChange={(e) => onChange("status", e.target.value)}
          className="lg:w-36"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" onClick={onClear} icon={<X />} className="min-h-8 self-end px-3 lg:self-auto">
          ניקוי סינונים
        </Button>
      )}
    </div>
  );
}