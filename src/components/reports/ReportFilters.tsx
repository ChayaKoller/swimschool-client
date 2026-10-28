import { Search, X } from "lucide-react";
import type { ReportFilterValues } from "../../api/reports/schema";
import { healthFundLabels, toOptions } from "../../lib/labels";
import FormField from "../form/FormField";
import SelectField from "../form/SelectField";
import TextField from "../form/TextField";
import Button from "../ui/Button";

export type ReportFiltersProps = {
  values: ReportFilterValues;
  onChange: (key: keyof ReportFilterValues, value: string) => void;
  onClear: () => void;
  hasFilters: boolean;
  rangeInvalid: boolean;
};

const healthFundOptions = toOptions(healthFundLabels);

export default function ReportFilters({ values, onChange, onClear, hasFilters, rangeInvalid }: ReportFiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-card border-[1.5px] border-line bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink/50" />
          <TextField
            aria-label='חיפוש לפי שם או ת"ז'
            type="search"
            placeholder='חיפוש לפי שם או ת"ז'
            value={values.search}
            onChange={(e) => onChange("search", e.target.value)}
            className="ps-9"
          />
        </div>

        <SelectField
          aria-label="סינון לפי קופה"
          placeholder="כל הקופות"
          value={values.healthFund}
          onChange={(e) => onChange("healthFund", e.target.value)}
          options={healthFundOptions}
          className="sm:w-48"
        />
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <div className="w-full sm:w-44">
          <FormField label="הונפק מתאריך" htmlFor="fromDate">
            <TextField
              id="fromDate"
              type="date"
              value={values.fromDate}
              onChange={(e) => onChange("fromDate", e.target.value)}
            />
          </FormField>
        </div>

        <div className="w-full sm:w-44">
          <FormField
            label="עד תאריך"
            htmlFor="toDate"
            error={rangeInvalid ? "תאריך הסיום לפני תאריך ההתחלה" : undefined}
          >
            <TextField
              id="toDate"
              type="date"
              value={values.toDate}
              onChange={(e) => onChange("toDate", e.target.value)}
              invalid={rangeInvalid}
              aria-describedby="toDate-description"
            />
          </FormField>
        </div>

        {hasFilters && (
          <Button variant="ghost" onClick={onClear} icon={<X />} className="ms-auto min-h-8 self-end px-3">
            ניקוי סינונים
          </Button>
        )}
      </div>
    </div>
  );
}