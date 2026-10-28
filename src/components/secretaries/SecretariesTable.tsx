import { KeyRound, UserX } from "lucide-react";
import type { SecretaryDto } from "../../types/typesDtos";
import { formatDateTime } from "../../lib/format";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import DataTable, { type Column } from "../ui/DataTable";

export type SecretariesTableProps = {
  secretaries: SecretaryDto[];
  onSetPassword: (secretary: SecretaryDto) => void;
  onDeactivate: (secretary: SecretaryDto) => void;
};

function renderStatus(s: SecretaryDto) {
  return s.isActive ? <Badge tone="success">פעילה</Badge> : <Badge tone="neutral">הגישה בוטלה</Badge>;
}

function renderLastLogin(s: SecretaryDto) {
  return s.lastLoginAt ? (
    <span className="whitespace-nowrap tabular-nums">{formatDateTime(s.lastLoginAt)}</span>
  ) : (
    <span className="text-slate-500">לא נכנסה עדיין</span>
  );
}

const baseColumns: Column<SecretaryDto>[] = [
  {
    key: "fullName",
    header: "שם",
    render: (s) => (
      <span className={s.isActive ? "font-semibold text-line" : "font-semibold text-slate-500"}>{s.fullName}</span>
    ),
  },
  {
    key: "email",
    header: "אימייל",
    render: (s) => (
      <span dir="ltr" className="break-all text-slate-700">
        {s.email}
      </span>
    ),
  },
  {
    key: "phone",
    header: "טלפון",
    render: (s) => (
      <span dir="ltr" className="whitespace-nowrap tabular-nums">
        {s.phone}
      </span>
    ),
  },
  { key: "isActive", header: "מצב", render: renderStatus },
  { key: "lastLoginAt", header: "כניסה אחרונה", render: renderLastLogin },
];

export default function SecretariesTable({ secretaries, onSetPassword, onDeactivate }: SecretariesTableProps) {
  function renderActions(s: SecretaryDto) {
    if (!s.isActive) return null;
    return (
      <div className="flex flex-wrap items-center justify-end gap-1">
        <Button
          variant="ghost"
          icon={<KeyRound />}
          onClick={() => onSetPassword(s)}
          aria-label={`סיסמה חדשה ל${s.fullName}`}
          className="px-3"
        >
          סיסמה חדשה
        </Button>
        <Button
          variant="ghost"
          icon={<UserX />}
          onClick={() => onDeactivate(s)}
          aria-label={`ביטול הגישה של ${s.fullName}`}
          className="px-3"
        >
          ביטול גישה
        </Button>
      </div>
    );
  }

  const columns: Column<SecretaryDto>[] = [...baseColumns, { key: "actions", header: "", render: renderActions }];

  return (
    <DataTable
      columns={columns}
      rows={secretaries}
      getRowKey={(s) => s.id}
      mobileCard={(s) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate font-semibold text-line">{s.fullName}</p>
            {renderStatus(s)}
          </div>
          <div className="flex flex-col gap-0.5 text-sm text-slate-600">
            <span dir="ltr" className="break-all text-end">
              {s.email}
            </span>
            <span dir="ltr" className="text-end tabular-nums">
              {s.phone}
            </span>
          </div>
          <p className="text-xs text-slate-500">כניסה אחרונה: {renderLastLogin(s)}</p>
          {renderActions(s)}
        </div>
      )}
    />
  );
}