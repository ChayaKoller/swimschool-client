import { FileText, UsersRound, Wallet } from "lucide-react";
import { useGroups } from "../../api/groups/hook";
import { useReports } from "../../api/reports/hook";
import { useStudents } from "../../api/students/hook";
import { todayIsrael } from "../../lib/format";
import StatLink from "./StatLink";

export default function HomeStats() {
  const monthStart = `${todayIsrael().slice(0, 7)}-01`;

  const unpaid = useStudents({ onlyUnpaid: true, page: 1, pageSize: 1 });
  const activeGroups = useGroups({ isActive: true, page: 1, pageSize: 1 });
  const monthReports = useReports({ fromDate: monthStart, page: 1, pageSize: 1 });

  return (
    <section aria-labelledby="stats-title" className="flex flex-col gap-3">
      <h2 id="stats-title" className="text-lg font-bold text-ink">
        תמונת מצב
      </h2>

      <ul className="grid gap-3 sm:grid-cols-3">
        <li>
          <StatLink
            to="/students?onlyUnpaid=true"
            label="תלמידות עם חוב"
            icon={Wallet}
            count={unpaid.data?.totalCount}
            isError={unpaid.isError}
          />
        </li>
        <li>
          <StatLink
            to="/groups?year=all"
            label="קבוצות פעילות"
            icon={UsersRound}
            count={activeGroups.data?.totalCount}
            isError={activeGroups.isError}
          />
        </li>
        <li>
          <StatLink
            to={`/reports?fromDate=${monthStart}`}
            label="דוחות החודש"
            icon={FileText}
            count={monthReports.data?.totalCount}
            isError={monthReports.isError}
          />
        </li>
      </ul>
    </section>
  );
}