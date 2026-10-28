import { useState } from "react";
import useDebounce from "../../lib/useDebounce";
import { useStudents } from "../../api/students/hook";
import SearchPicker from "../ui/SearchPicker";

export default function StudentPicker() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 300);
  const studentsQuery = useStudents({
    name: debounced,
    page: 1,
    pageSize: 10,
  });
  const isEmptyQuery = debounced.trim() === "";
  const items = isEmptyQuery ? [] : (studentsQuery.data?.items ?? []);

  return (
    <SearchPicker
      name="studentId"
      label="תלמידה"
      placeholder="חפשי תלמידה לפי שם"
      query={query}
      onQueryChange={setQuery}
      items={items}
      isLoading={!isEmptyQuery && studentsQuery.isLoading}
      error={isEmptyQuery ? null : studentsQuery.error}
      emptyText={isEmptyQuery ? "הקלידי שם כדי לחפש" : "לא נמצאה תלמידה בשם הזה"}
      getKey={(s) => s.id}
      renderItem={(student) => (
        <div className="flex flex-col gap-0.5">
          <span className="truncate font-semibold text-line">{student.fullName}</span>
          <span className="text-xs text-ink/70">
            ת"ז {student.identityNumber} · <span dir="ltr">{student.phone}</span>
          </span>
        </div>
      )}
    />
  );
}