import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '../api/endpoints'
import PageHeader from '../components/PageHeader'
import ReportsTable from '../components/ReportsTable'
import { Empty, ErrorState, Loading } from '../components/States'
import { formatDay, formatMoney, healthFundLabels, seasonLabels } from '../lib/format'

export default function StudentDetailsPage() {
  const id = Number(useParams().id)
  const student = useQuery({ queryKey: ['student', id], queryFn: () => studentsApi.get(id), enabled: Number.isInteger(id) })
  const reports = useQuery({ queryKey: ['student', id, 'reports'], queryFn: () => studentsApi.reports(id), enabled: Number.isInteger(id) })

  if (student.isPending) return <Loading />
  if (student.isError) return <ErrorState error={student.error} onRetry={() => student.refetch()} />
  const s = student.data
  const owed = s.groups.reduce((sum, g) => sum + Math.max(0, g.amountDue - g.amountPaid), 0)

  const details: [string, string][] = [
    ['תעודת זהות', s.identityNumber],
    ['טלפון', s.phone],
    ['אימייל', s.email || '—'],
    ['תאריך לידה', formatDay(s.birthDate)],
    ['קופת חולים', healthFundLabels[s.healthFund]],
    ['מורה אחראית', s.responsibleTeacherName],
  ]

  return (
    <>
      <Link to="/students" className="font-medium text-water hover:underline">
        → חזרה לתלמידות
      </Link>
      <PageHeader
        title={s.fullName}
        subtitle={s.isActive ? (owed > 0 ? `חוב פתוח: ${formatMoney(owed)}` : 'אין חוב פתוח') : 'בארכיון'}
        actions={
          <Link to={`/reports/new?studentId=${s.id}`} className="btn-primary">
            + דוח חדש לקופה
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="card min-w-0">
          <h2 className="border-b border-line p-3.5 text-lg font-bold text-brand">פרטים אישיים</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 p-3.5">
            {details.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted">{label}</dt>
                <dd className="font-medium tabular" dir={label === 'טלפון' || label === 'אימייל' ? 'ltr' : undefined} style={{ textAlign: 'right' }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          {s.placementRequest && (
            <div className="border-t border-line p-3.5">
              <div className="text-muted">בקשת שיבוץ</div>
              <div className="mt-1">{s.placementRequest}</div>
            </div>
          )}
        </div>

        <div className="card min-w-0">
          <h2 className="border-b border-line p-3.5 text-lg font-bold text-brand">קבוצות ותשלומים</h2>
          {s.groups.length === 0 ? (
            <Empty text="התלמידה לא רשומה לאף קבוצה כרגע" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse tabular">
                <thead>
                  <tr>
                    <th className="th">קבוצה</th>
                    <th className="th">עונה</th>
                    <th className="th">לתשלום</th>
                    <th className="th">שולם</th>
                    <th className="th">מצב</th>
                  </tr>
                </thead>
                <tbody>
                  {s.groups.map((g) => (
                    <tr key={g.enrollmentId}>
                      <td className="td">
                        <Link to={`/groups/${g.groupId}`} className="font-bold text-brand hover:text-water">
                          {g.groupName}
                        </Link>
                      </td>
                      <td className="td">
                        {seasonLabels[g.season]} {g.year}
                      </td>
                      <td className="td">{formatMoney(g.amountDue)}</td>
                      <td className="td">{formatMoney(g.amountPaid)}</td>
                      <td className="td">{g.amountPaid >= g.amountDue ? <span className="chip-leaf">שולם</span> : <span className="chip-berry">חסר {formatMoney(g.amountDue - g.amountPaid)}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-3.5">
          <h2 className="text-lg font-bold text-brand">דוחות לקופה</h2>
          {reports.data && reports.data.length > 0 && <span className="text-sm text-muted">{reports.data.length} דוחות</span>}
        </div>
        {reports.isPending ? (
          <Loading />
        ) : reports.isError ? (
          <ErrorState error={reports.error} onRetry={() => reports.refetch()} />
        ) : reports.data.length === 0 ? (
          <Empty text="עדיין לא הופקו דוחות לתלמידה הזו" />
        ) : (
          <ReportsTable reports={reports.data} showStudent={false} />
        )}
      </div>
    </>
  )
}
