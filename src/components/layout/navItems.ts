import type { LucideIcon } from "lucide-react";
import { CalendarDays, FileText, House, Settings, UserCog, Users, UsersRound } from "lucide-react";
import type { UserRole } from "../../types/typesDtos";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  teacherOnly?: boolean;
};

export const navItems: NavItem[] = [
  { to: "/", label: "בית", icon: House },
  { to: "/schedule", label: "מערכת שעות", icon: CalendarDays, teacherOnly: true },
  { to: "/students", label: "תלמידות", icon: Users },
  { to: "/groups", label: "קבוצות", icon: UsersRound },
  { to: "/reports", label: "דוחות לקופות", icon: FileText },
  { to: "/secretaries", label: "מזכירות", icon: UserCog, teacherOnly: true },
  { to: "/settings", label: "הגדרות", icon: Settings, teacherOnly: true },
];

// הפריטים שמותר לתפקיד לראות
export function navItemsFor(role: UserRole): NavItem[] {
  return navItems.filter((item) => !item.teacherOnly || role === "Teacher");
}

// הפריט של העמוד הנוכחי, בשביל השם בכותרת העליונה
export function findNavItem(pathname: string): NavItem | undefined {
  return navItems.find((item) =>
    item.to === "/" ? pathname === "/" : pathname.startsWith(item.to),
  );
}