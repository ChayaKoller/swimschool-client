import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '../api/endpoints'
import type { StudentListItem } from '../api/types'
import { healthFundLabels } from '../lib/format'
import { useDebounced } from './useDebounced'

interface Props {
  value: StudentListItem | null
  onChange: (student: StudentListItem | null) => void
  excludeIds?: number[]
  error?: string
  autoFocus?: boolean
}

// Search a student by name and pick her from the results
export default function StudentPicker({ value, onChange, excludeIds = [], error, autoFocus }: Props) {
  const [text, setText] = useState('')
  const search = useDebounced(text.trim())

  const { data, isFetching } = useQuery({
    queryKey: ['students', 'picker', search],
    queryFn: () => studentsApi.list({ name: search || undefined, pageSize: 8 }),
    enabled: value === null,
  })

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-[10px] border border-water-bright bg-water-tint px-3 py-2">
        <div className="min-w-0">
          <div className="font-bold text-brand">{value.fullName}</div>
          <div className="text-sm text-muted tabular">
            {value.identityNumber} · {healthFundLabels[value.healthFund]}
          </div>
        </div>
        <button type="button" className="btn-ghost btn-sm" onClick={() => onChange(null)}>
          החלפה
        </button>
      </div>
    )
  }

  const options = (data?.items ?? []).filter((s) => !excludeIds.includes(s.id))
  return (
    <div>
      <input
        className={`input ${error ? 'input-error' : ''}`}
        placeholder="הקלידי שם תלמידה לחיפוש"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus={autoFocus}
      />
      <div className="mt-2 max-h-56 overflow-y-auto rounded-[10px] border border-line">
        {options.length === 0 ? (
          <div className="p-3 text-sm text-muted">{isFetching ? 'מחפש...' : 'לא נמצאו תלמידות מתאימות'}</div>
        ) : (
          options.map((s) => (
            <button
              type="button"
              key={s.id}
              className="flex w-full items-center justify-between gap-2 border-b border-line-soft px-3 py-2 text-right last:border-b-0 hover:bg-water-tint"
              onClick={() => onChange(s)}
            >
              <span className="font-medium">{s.fullName}</span>
              <span className="text-sm text-muted tabular">
                {s.identityNumber} · {healthFundLabels[s.healthFund]}
              </span>
            </button>
          ))
        )}
      </div>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  )
}
