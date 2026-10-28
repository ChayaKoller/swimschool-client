
import { Link, useLocation } from "react-router";
import { KeyRound, LogOut, Menu } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { roleLabels } from "../../lib/labels";
import Button from "../ui/Button";
import { findNavItem } from "./navItems";

export type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  if (!user) return null;

  const current = findNavItem(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b-[1.5px] border-line bg-white/90 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="פתיחת התפריט"
        className="grid size-10 place-items-center rounded-full border-[1.5px] border-line bg-white md:hidden"
      >
        <Menu className="size-5" />
      </button>

      {current && <span className="truncate text-sm font-semibold text-slate-500">{current.label}</span>}

      <div className="ms-auto flex items-center gap-3">
        <div
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full border-[1.5px] border-line bg-lavender/25 text-base font-bold text-ink"
        >
          {user?.fullName[0]}
        </div>

        <div className="hidden leading-tight sm:block">
          <div className="text-sm font-bold text-line">{user.fullName}</div>
          <div className="text-xs text-slate-500">{roleLabels[user.role]}</div>
        </div>

        <Link
          to="/account/password"
          className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-primary-text hover:bg-primary/10 lg:inline-flex"
        >
          <KeyRound className="size-4" />
          החלפת סיסמה
        </Link>

        <Button variant="ghost" onClick={logout} icon={<LogOut />} aria-label="יציאה" className="px-3">
          <span className="hidden sm:inline">יציאה</span>
        </Button>
      </div>
    </header>
  );
}