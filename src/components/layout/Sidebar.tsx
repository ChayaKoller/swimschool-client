import { NavLink } from "react-router";
import clsx from "clsx";
import { X } from "lucide-react";
import { navItemsFor } from "./navItems";
import { useAuth } from "../../context/useAuth";
import sideLogo from "../../assets/sideLogo.png";

export type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      {/* שכבה כהה מאחורי המגירה, רק בטלפון כשהיא פתוחה */}
      {isOpen && (
        <div aria-hidden="true" onClick={onClose} className="fixed inset-0 z-30 bg-slate-900/40 md:hidden" />
      )}

      <nav
        aria-label="תפריט ראשי"
        className={clsx(
          "fixed inset-y-0 start-0 z-40 flex w-64 flex-col gap-1 border-e-[1.5px] border-line bg-white p-4 transition-transform duration-200",
          "md:sticky md:top-0 md:h-dvh md:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* הלוגו, וקו דק שמפריד בינו לבין הקישורים */}
        <div className="mb-5 flex items-center justify-between border-b-[1.5px] border-line/10 pb-4">
          <img src={sideLogo} alt="לוגו בית הספר לשחייה" className="h-16 w-auto" />
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירת התפריט"
            className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-page md:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {navItemsFor(user.role).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-full border-[1.5px] px-4 py-2.5 text-sm font-semibold transition",
                isActive
                  ? "border-line bg-pink text-line shadow-hard"
                  : "border-transparent text-slate-600 hover:bg-page hover:text-line",
              )
            }
          >
            <item.icon className="size-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
