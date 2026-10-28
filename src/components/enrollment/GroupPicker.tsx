import { useState } from "react";
import type { GroupDto } from "../../types/typesDtos";
import useDebounce from "../../lib/useDebounce";
import { useGroups } from "../../api/groups/hook";
import { seasonLabels } from "../../lib/labels";
import { formatMoney } from "../../lib/format";
import SearchPicker from "../ui/SearchPicker";
import OccupancyBar from "../groups/OccupancyBar";

export type GroupPickerProps = {
  onPick: (group: GroupDto) => void;
};

export default function GroupPicker({ onPick }: GroupPickerProps) {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 300);
  const groupsQuery = useGroups({
    name: debounced,
    isActive: true,
    page: 1,
    pageSize: 20,
  });

  return (
    <SearchPicker
      name="groupId"
      label="קבוצה"
      placeholder="חפשי קבוצה לפי שם"
      query={query}
      onQueryChange={setQuery}
      items={groupsQuery.data?.items ?? []}
      isLoading={groupsQuery.isLoading}
      error={groupsQuery.error}
      emptyText={debounced.trim() ? "לא נמצאה קבוצה בשם הזה" : "אין קבוצות פעילות. יש לפתוח קבוצה קודם"}
      getKey={(g) => g.id}
      isDisabled={(g) => g.freeSpots === 0}
      onPick={onPick}
      renderItem={(group) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate font-semibold text-line">{group.name}</span>
            <span className="shrink-0 font-semibold text-line tabular-nums">{formatMoney(group.price)}</span>
          </div>
          <span className="text-xs text-ink/70">
            {seasonLabels[group.season]} {group.year}
          </span>
          <OccupancyBar enrolled={group.enrolledCount} max={group.maxStudents} />
        </div>
      )}
    />
  );
}