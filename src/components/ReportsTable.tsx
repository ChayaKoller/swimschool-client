import type { Report } from '../api/types'
import { formatDate, formatMoney, healthFundLabels } from '../lib/format'
import ReportActions from './ReportActions'
import { Link } from 'react-router-dom'

export default function ReportsTable({ reports, showStudent = true }: { reports: Report[]; showStudent?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse tabular">
        <thead>
          <tr>
            {showStudent && <th className="th">תלמידה</th>}
            <th className="th">קופה</th>
            <th className="th">סוג טיפול</th>
            <th className="th">טיפולים</th>
            <th className="th">סכום</th>
            <th className="th">הופק</th>
            <th className="th">
              <span className="sr-only">פעולות</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id} className="hover:bg-[#fcfaf8]">
              {showStudent && (
                <td className="td">
                  <Link to={`/students/${r.studentId}`} className="font-bold text-brand hover:text-water">
                    {r.studentName}
                  </Link>
                </td>
              )}
              <td className="td">{r.insuranceCompany || healthFundLabels[r.healthFund]}</td>
              <td className="td">
                <span className={r.treatmentType === 'Individual' ? 'chip-berry' : 'chip-water'}>{r.treatmentType === 'Individual' ? 'פרטני' : 'בקבוצה'}</span>
              </td>
              <td className="td">{r.lessonDates.length}</td>
              <td className="td">{formatMoney(r.totalAmount)}</td>
              <td className="td">{formatDate(r.issuedAt)}</td>
              <td className="td">
                <ReportActions reportId={r.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
