import { useState } from 'react'
import { ApiError } from '../api/client'
import { downloadReportPdf, previewReportPdf } from '../lib/pdf'
import { useToast } from './Toast'

export default function ReportActions({ reportId }: { reportId: number }) {
  const toast = useToast()
  const [busy, setBusy] = useState<'download' | 'preview' | null>(null)

  async function run(kind: 'download' | 'preview') {
    setBusy(kind)
    try {
      if (kind === 'download') {
        const name = await downloadReportPdf(reportId)
        toast.success('הדוח הורד', name)
      } else {
        await previewReportPdf(reportId)
      }
    } catch (err) {
      const e = err instanceof ApiError ? err : new ApiError(0, null)
      toast.error('לא הצלחנו להפיק את הדוח', e.message, e.traceId)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex gap-1.5">
      <button className="btn-primary btn-sm" disabled={busy !== null} onClick={(e) => { e.stopPropagation(); run('download') }}>
        {busy === 'download' ? 'מוריד...' : 'הורד PDF'}
      </button>
      <button className="btn-ghost btn-sm" disabled={busy !== null} onClick={(e) => { e.stopPropagation(); run('preview') }}>
        תצוגה
      </button>
    </div>
  )
}
