import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { groupsApi } from '../api/endpoints'
import type { Season } from '../api/types'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import { Empty, ErrorState, Loading } from '../components/States'
import { useDebounced } from '../components/useDebounced'
import { formatMoney, seasonLabels } from '../lib/format'

const PAGE_SIZE = 20

export default function GroupsPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [season, setSeason] = useState<Season | ''>('')
  const [activeOnly, setActiveOnly] = useState(true)
  const [page, setPage] = useState(1)
  const search = useDebounced(name.trim())

  const query = useQuery({
    queryKey: ['groups', { search, season, activeOnly, page }],
    queryFn: () => groupsApi.list({ name: search || undefined, season, isActive: activeOnly ? true : undefined, page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })

  return (
    <>
      <PageHeader title="הקבוצות שלי" subtitle={query.data ? `${query.data.totalCount} קבוצות` : undefined} />
      <div className="card">
        <div className="flex flex-wrap gap-3 p-3.5">
          <div className="min-w-[160px] flex-1">
            <label className="field-label" htmlFor="g-name">
              חיפוש לפי שם
            </label>
            <input id="g-name" className="input" placeholder="למשל: מתחילות" value={name} onChange={(e) => { setName(e.target.value); setPage(1) }} />
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="field-label" htmlFor="g-season">
              עונה
            </label>
            <select id="g-season" className="input" value={season} onChange={(e) => { setSeason(e.target.value as Season | ''); setPage(1) }}>
              <option value="">כל העונות</option>
              {Object.entries(seasonLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="field-label" htmlFor="g-active">
              מצב
            </label>
            <select id="g-active" className="input" value={activeOnly ? 'active' : 'all'} onChange={(e) => { setActiveOnly(e.target.value === 'active'); setPage(1) }}>
              <option value="active">פעילות בלבד</option>
              <option value="all">כולל ארכיון</option>
            </select>
          </div>
        </div>

        {query.isPending ? (
          <Loading />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <Empty text="לא נמצאו קבוצות" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse tabular">
                <thead>
                  <tr>
                    <th className="th">שם הקבוצה</th>
                    <th className="th">עונה</th>
                    <th className="th">שיעורים</th>
                    <th className="th">מקומות</th>
                    <th className="th">מחיר</th>
                    <th className="th">מצב</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.items.map((g) => {
                    const full = g.freeSpots <= 0
                    const percent = g.maxStudents > 0 ? Math.min(100, Math.round((g.enrolledCount / g.maxStudents) * 100)) : 0
                    return (
                      <tr key={g.id} className="cursor-pointer hover:bg-[#fcfaf8]" onClick={() => navigate(`/groups/${g.id}`)}>
                        <td className="td">
                          <button className="font-bold text-brand hover:text-water" onClick={() => navigate(`/groups/${g.id}`)}>
                            {g.name}
                          </button>
                        </td>
                        <td className="td">
                          {seasonLabels[g.season]} {g.year}
                        </td>
                        <td className="td">{g.lessonsCount}</td>
                        <td className="td">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-[70px] overflow-hidden rounded-full bg-sand">
                              <div className={`h-full ${full ? 'bg-berry' : 'bg-water-bright'}`} style={{ width: `${percent}%` }} />
                            </div>
                            {g.enrolledCount} / {g.maxStudents}
                          </div>
                        </td>
                        <td className="td">{formatMoney(g.price)}</td>
                        <td className="td">
                          {!g.isActive ? <span className="chip-muted">בארכיון</span> : full ? <span className="chip-berry">מלאה</span> : <span className="chip-leaf">פעילה</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={query.data.page} totalPages={query.data.totalPages} totalCount={query.data.totalCount} pageSize={query.data.pageSize} onChange={setPage} />
          </>
        )}
      </div>
    </>
  )
}
