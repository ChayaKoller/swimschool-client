import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { studentsApi } from '../api/endpoints'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import { Empty, ErrorState, Loading } from '../components/States'
import { useDebounced } from '../components/useDebounced'
import { formatMoney, healthFundLabels } from '../lib/format'
import NewStudentDialog from './NewStudentDialog'

const PAGE_SIZE = 20

export default function StudentsPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [onlyUnpaid, setOnlyUnpaid] = useState(false)
  const [absent, setAbsent] = useState(false)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [page, setPage] = useState(1)
  const [adding, setAdding] = useState(false)
  const search = useDebounced(name.trim())

  const query = useQuery({
    queryKey: ['students', { search, onlyUnpaid, absent, includeInactive, page }],
    queryFn: () =>
      studentsApi.list({
        name: search || undefined,
        onlyUnpaid: onlyUnpaid || undefined,
        absentMoreThan: absent ? 2 : undefined,
        includeInactive: includeInactive || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  })

  const toggle = (setter: (v: boolean) => void) => (e: { target: { checked: boolean } }) => {
    setter(e.target.checked)
    setPage(1)
  }

  return (
    <>
      <PageHeader
        title="תלמידות"
        subtitle={query.data ? `${query.data.totalCount} תלמידות` : undefined}
        actions={
          <button className="btn-primary" onClick={() => setAdding(true)}>
            + תלמידה חדשה
          </button>
        }
      />
      <div className="card">
        <div className="flex flex-wrap items-end gap-x-5 gap-y-3 p-3.5">
          <div className="min-w-[200px] flex-1">
            <label className="field-label" htmlFor="st-name">
              חיפוש לפי שם
            </label>
            <input id="st-name" className="input" placeholder="שם התלמידה" value={name} onChange={(e) => { setName(e.target.value); setPage(1) }} />
          </div>
          <label className="flex items-center gap-2 py-2">
            <input type="checkbox" className="size-4 accent-water" checked={onlyUnpaid} onChange={toggle(setOnlyUnpaid)} />
            לא שילמו במלואו
          </label>
          <label className="flex items-center gap-2 py-2">
            <input type="checkbox" className="size-4 accent-water" checked={absent} onChange={toggle(setAbsent)} />
            נעדרו יותר מפעמיים
          </label>
          <label className="flex items-center gap-2 py-2">
            <input type="checkbox" className="size-4 accent-water" checked={includeInactive} onChange={toggle(setIncludeInactive)} />
            כולל ארכיון
          </label>
        </div>

        {query.isPending ? (
          <Loading />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <Empty text="לא נמצאו תלמידות" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse tabular">
                <thead>
                  <tr>
                    <th className="th">שם</th>
                    <th className="th">ת"ז</th>
                    <th className="th">טלפון</th>
                    <th className="th">קופה</th>
                    <th className="th">תשלום</th>
                    <th className="th">היעדרויות</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.items.map((s) => (
                    <tr key={s.id} className="cursor-pointer hover:bg-[#fcfaf8]" onClick={() => navigate(`/students/${s.id}`)}>
                      <td className="td">
                        <Link to={`/students/${s.id}`} className="font-bold text-brand hover:text-water" onClick={(e) => e.stopPropagation()}>
                          {s.fullName}
                        </Link>
                        {!s.isActive && <span className="chip-muted ms-2">בארכיון</span>}
                      </td>
                      <td className="td">{s.identityNumber}</td>
                      <td className="td" dir="ltr" style={{ textAlign: 'right' }}>
                        {s.phone}
                      </td>
                      <td className="td">{healthFundLabels[s.healthFund]}</td>
                      <td className="td">{s.amountOwed > 0 ? <span className="chip-berry">חסר {formatMoney(s.amountOwed)}</span> : <span className="chip-leaf">שולם</span>}</td>
                      <td className="td">{s.absencesCount > 2 ? <span className="chip-berry">{s.absencesCount}</span> : s.absencesCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={query.data.page} totalPages={query.data.totalPages} totalCount={query.data.totalCount} pageSize={query.data.pageSize} onChange={setPage} />
          </>
        )}
      </div>
      {adding && <NewStudentDialog onClose={() => setAdding(false)} />}
    </>
  )
}
