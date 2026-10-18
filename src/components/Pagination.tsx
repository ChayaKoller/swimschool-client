interface Props {
  page: number
  totalPages: number
  totalCount: number
  pageSize: number
  onChange: (page: number) => void
}

export default function Pagination({ page, totalPages, totalCount, pageSize, onChange }: Props) {
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3.5 py-3 text-sm text-muted">
      <span className="tabular">
        מציג {from} עד {to} מתוך {totalCount}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button className="btn-ghost btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
            הקודם
          </button>
          <span className="tabular">
            עמוד {page} מתוך {totalPages}
          </span>
          <button className="btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
            הבא
          </button>
        </div>
      )}
    </div>
  )
}
