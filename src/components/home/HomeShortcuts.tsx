import { CalendarDays, FilePlus2, UserPlus, UsersRound } from "lucide-react";
import { Link } from "react-router";
import type { UserRole } from "../../types/typesDtos";
import type { NavItem } from "../layout/navItems";

type Shortcut = NavItem & { description: string };

const shortcuts: Shortcut[] = [
  { to: "/schedule", label: "מערכת השעות", description: "השיעורים של השבוע, וסימון נוכחות", icon: CalendarDays, teacherOnly: true },
  { to: "/students/new", label: "תלמידה חדשה", description: "הוספת תלמידה, ואחר כך רישום לקבוצה", icon: UserPlus },
  { to: "/groups/new", label: "קבוצה חדשה", description: "פתיחת קבוצה עם השיעורים שלה", icon: UsersRound },
  { to: "/reports/new", label: "דוח חדש", description: "דוח לקופת חולים או לביטוח", icon: FilePlus2 },
];

export type HomeShortcutsProps = {
  role: UserRole;
};

export default function HomeShortcuts({ role }: HomeShortcutsProps) {
  const visible = shortcuts.filter((s) => !s.teacherOnly || role === "Teacher");

  return (
    <nav aria-label="קיצורי דרך">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((s) => (
          <li key={s.to} className="flex">
            <Link
              to={s.to}
              className="group flex w-full items-start gap-3 rounded-card border-[1.5px] border-line bg-white p-4 transition hover:-translate-y-px hover:shadow-hard"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full border-[1.5px] border-line bg-lavender/25 text-line transition group-hover:bg-pink/30">
                <s.icon aria-hidden className="size-5" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-bold text-line">{s.label}</span>
                <span className="text-sm leading-snug text-ink/70">{s.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}