import { Search, X } from "lucide-react";
import type { StudentFilterValues } from "../../api/students/schema";
import Checkbox from "../form/Checkbox";
import SelectField from "../form/SelectField";
import TextField from "../form/TextField";
import Button from "../ui/Button";

type StudentFiltersProps = {
  values: StudentFilterValues;
  onChange: (key: keyof StudentFilterValues, value: string) => void;
  onClear: () => void;
  hasFilters: boolean;
  groupOptions: { value: string; label: string }[];
};

// תיבות הסימון נראות כמו "צ'יפים": גלולה עם מסגרת, שנצבעת ורוד כשמסומנת
const chipClasses =
  "rounded-full border-[1.5px] border-ink/20 bg-white px-3 py-1.5 transition hover:border-ink/40 " +
  "has-checked:border-line has-checked:bg-pink/15 has-focus-visible:ring-2 has-focus-visible:ring-primary/40";

export default function StudentFilters({ values, onChange, onClear, hasFilters, groupOptions }: StudentFiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-card border-[1.5px] border-line bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
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

        <SelectField
          aria-label="סינון לפי קבוצה"
          placeholder="כל הקבוצות"
          value={values.groupId}
          onChange={(e) => onChange("groupId", e.target.value)}
          options={groupOptions}
          className="sm:w-56"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Checkbox
          label="רק עם חוב"
          checked={values.onlyUnpaid === "true"}
          onChange={(e) => onChange("onlyUnpaid", e.target.checked ? "true" : "")}
          className={chipClasses}
        />
        <Checkbox
          label="נעדרו יותר מפעמיים"
          checked={values.absent === "true"}
          onChange={(e) => onChange("absent", e.target.checked ? "true" : "")}
          className={chipClasses}
        />
        <Checkbox
          label="כולל ארכיון"
          checked={values.includeInactive === "true"}
          onChange={(e) => onChange("includeInactive", e.target.checked ? "true" : "")}
          className={chipClasses}
        />

        {hasFilters && (
          <Button variant="ghost" onClick={onClear} icon={<X />} className="ms-auto min-h-8 px-3">
            ניקוי סינונים
          </Button>
        )}
      </div>
    </div>
  );
}