import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { groupsApi } from '../api/endpoints'
import PageHeader from '../components/PageHeader'
import { Empty, ErrorState, Loading } from '../components/States'
import { formatDateTime, formatMoney, seasonLabels } from '../lib/format'
import EnrollDialog from './EnrollDialog'

export default function GroupDetailsPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const [enrolling, setEnrolling] = useState(false)
  const query = useQuery({ queryKey: ['group', id], queryFn: () => groupsApi.get(id), enabled: Number.isInteger(id) })

  if (query.isPending) return <Loading />
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />

  const group = query.data
  const full = group.freeSpots <= 0
  const unpaid = group.students.filter((s) => s.amountOwed > 0).length
  const now = Date.now()
  const upcoming = group.lessons.filter((l) => new Date(l.startTime).getTime() >= now)
  const past = group.lessons.length - upcoming.length

  return (
    <>
      <Link to="/groups" className="font-medium text-water hover:underline">
        → חזרה לקבוצות
      </Link>
      <PageHeader
        title={group.name}
        subtitle={`${seasonLabels[group.season]} ${group.year}${group.isActive ? '' : ' · בארכיון'}`}
        actions={
          <button className="btn-primary" disabled={full || !group.isActive} onClick={() => setEnrolling(true)} title={full ? 'הקבוצה מלאה' : undefined}>
            + רישום תלמידה
          </button>
        }
      />

      <div className="card grid grid-cols-2 tabular md:grid-cols-4">
        {[
          [`${group.enrolledCount} / ${group.maxStudents}`, 'תלמידות רשומות'],
          [String(group.lessonsCount), 'שיעורים בקורס'],
          [formatMoney(group.price), 'מחיר הקבוצה'],
          [String(unpaid), 'לא שילמו במלואו'],
        ].map(([value, label], i) => (
          <div key={label} className={`p-3.5 ${i % 2 === 0 ? 'border-l border-line' : ''} ${i < 2 ? 'border-b border-line md:border-b-0' : ''} md:border-l md:last:border-l-0`}>
            <b className="block text-xl text-brand">{value}</b>
            <span className="text-[13px] text-muted">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="card min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-3.5">
            <h2 className="text-lg font-bold text-brand">תלמידות בקבוצה</h2>
            <span className={full ? 'chip-berry' : 'chip-water'}>{full ? 'הקבוצה מלאה' : group.freeSpots === 1 ? 'מקום אחד פנוי' : `${group.freeSpots} מקומות פנויים`}</span>
          </div>
          {group.students.length === 0 ? (
            <Empty text="עדיין אין תלמידות בקבוצה" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse tabular">
                <thead>
                  <tr>
                    <th className="th">שם</th>
                    <th className="th">תשלום</th>
                  </tr>
                </thead>
                <tbody>
                  {group.students.map((s) => (
                    <tr key={s.id} className="cursor-pointer hover:bg-[#fcfaf8]" onClick={() => navigate(`/students/${s.id}`)}>
                      <td className="td">
                        <Link to={`/students/${s.id}`} className="font-bold text-brand hover:text-water" onClick={(e) => e.stopPropagation()}>
                          {s.fullName}
                        </Link>
                      </td>
                      <td className="td">{s.amountOwed > 0 ? <span className="chip-berry">חסר {formatMoney(s.amountOwed)}</span> : <span className="chip-leaf">שולם</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-3.5">
            <h2 className="text-lg font-bold text-brand">השיעורים הקרובים</h2>
            {past > 0 && <span className="text-sm text-muted">{past} שיעורים כבר התקיימו</span>}
          </div>
          {upcoming.length === 0 ? (
            <Empty text="אין שיעורים קרובים" />
          ) : (
            <ul className="py-1.5">
              {upcoming.slice(0, 8).map((l) => (
                <li key={l.lessonId} className="flex items-center justify-between gap-2 border-b border-line-soft px-3.5 py-2.5 last:border-b-0">
                  <span className="font-medium">{formatDateTime(l.startTime)}</span>
                  {l.isMakeup && <span className="chip-berry">שיעור השלמה</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {enrolling && <EnrollDialog group={group} onClose={() => setEnrolling(false)} />}
    </>
  )
}
