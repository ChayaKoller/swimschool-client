import { useState } from 'react'
import { Link } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { reportsApi } from '../api/endpoints'
import type { HealthFund } from '../api/types'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import ReportsTable from '../components/ReportsTable'
import { Empty, ErrorState, Loading } from '../components/States'
import { useDebounced } from '../components/useDebounced'
import { healthFundLabels } from '../lib/format'

const PAGE_SIZE = 20

export default function ReportsPage() {
  const [search, setSearch] = useState('')
  const [healthFund, setHealthFund] = useState<HealthFund | ''>('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const text = useDebounced(search.trim())
  const rangeInvalid = fromDate !== '' && toDate !== '' && fromDate > toDate

  const query = useQuery({
    queryKey: ['reports', { text, healthFund, fromDate, toDate, page }],
    queryFn: () => reportsApi.list({ search: text || undefined, healthFund, fromDate: fromDate || undefined, toDate: toDate || undefined, page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
    enabled: !rangeInvalid,
  })

  const reset = () => setPage(1)

  return (
    <>
      <PageHeader
        title="דוחות לקופות"
        subtitle="כל הדוחות שהופקו, מהחדש לישן"
        actions={
          <Link to="/reports/new" className="btn-primary">
            + דוח חדש
          </Link>
        }
      />
      <div className="card">
        <div className="flex flex-wrap gap-3 p-3.5">
          <div className="min-w-[180px] flex-[2]">
            <label className="field-label" htmlFor="r-search">
              שם תלמידה או ת"ז
            </label>
            <input id="r-search" className="input" placeholder="חיפוש" value={search} onChange={(e) => { setSearch(e.target.value); reset() }} />
          </div>
          <div className="min-w-[130px] flex-1">
            <label className="field-label" htmlFor="r-fund">
              קופה
            </label>
            <select id="r-fund" className="input" value={healthFund} onChange={(e) => { setHealthFund(e.target.value as HealthFund | ''); reset() }}>
              <option value="">כל הקופות</option>
              {Object.entries(healthFundLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="field-label" htmlFor="r-from">
              מתאריך הנפקה
            </label>
            <input id="r-from" type="date" className="input" value={fromDate} onChange={(e) => { setFromDate(e.target.value); reset() }} />
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="field-label" htmlFor="r-to">
              עד תאריך
            </label>
            <input id="r-to" type="date" className={`input ${rangeInvalid ? 'input-error' : ''}`} value={toDate} onChange={(e) => { setToDate(e.target.value); reset() }} />
          </div>
        </div>
        {rangeInvalid && <p className="px-3.5 pb-3 text-sm text-danger">תאריך ההתחלה מאוחר מתאריך הסיום</p>}

        {rangeInvalid ? null : query.isPending ? (
          <Loading />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <Empty text="לא נמצאו דוחות" />
        ) : (
          <>
            <ReportsTable reports={query.data.items} />
            <Pagination page={query.data.page} totalPages={query.data.totalPages} totalCount={query.data.totalCount} pageSize={query.data.pageSize} onChange={setPage} />
          </>
        )}
      </div>
    </>
  )
}
