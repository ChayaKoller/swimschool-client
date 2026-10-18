import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client'
import { reportsApi, studentsApi } from '../api/endpoints'
import type { StudentListItem, TreatmentType } from '../api/types'
import PageHeader from '../components/PageHeader'
import { Loading } from '../components/States'
import StudentPicker from '../components/StudentPicker'
import { useToast } from '../components/Toast'
import { formatMoney, healthFundLabels, israelToday, treatmentLabels } from '../lib/format'
import { downloadReportPdf } from '../lib/pdf'

const MAX_DATES = 34
const DEFAULT_SERVICE = 'טיפול רגשי במים'

export default function NewReportPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [params] = useSearchParams()
  const presetId = Number(params.get('studentId')) || null
  const today = israelToday()

  const settings = useQuery({ queryKey: ['report-settings'], queryFn: reportsApi.settings })
  const preset = useQuery({ queryKey: ['student', presetId], queryFn: () => studentsApi.get(presetId!), enabled: presetId !== null })

  const [student, setStudent] = useState<StudentListItem | null>(null)
  const [treatmentType, setTreatmentType] = useState<TreatmentType>('Group')
  const [price, setPrice] = useState('')
  const [service, setService] = useState(DEFAULT_SERVICE)
  const [insurance, setInsurance] = useState('')
  const [dates, setDates] = useState<string[]>([])
  const [initialized, setInitialized] = useState(false)
  const [touched, setTouched] = useState(false)
  const [serverError, setServerError] = useState<ApiError | null>(null)
  const [filling, setFilling] = useState(false)

  // Defaults from the teacher's report settings: price and number of empty date rows
  useEffect(() => {
    if (!settings.data || initialized) return
    setPrice(String(settings.data.defaultGroupPrice))
    setDates(Array(Math.min(MAX_DATES, Math.max(1, settings.data.defaultTreatmentsCount))).fill(''))
    setInitialized(true)
  }, [settings.data, initialized])

  // Opened from a student's page: that student is already chosen
  useEffect(() => {
    if (!preset.data || student) return
    const s = preset.data
    setStudent({ id: s.id, fullName: s.fullName, identityNumber: s.identityNumber, phone: s.phone, healthFund: s.healthFund, isActive: s.isActive, amountOwed: 0, absencesCount: 0 })
  }, [preset.data, student])

  function changeTreatment(type: TreatmentType) {
    setTreatmentType(type)
    const value = type === 'Group' ? settings.data?.defaultGroupPrice : settings.data?.defaultIndividualPrice
    setPrice(value != null ? String(value) : '')
  }

  const filled = dates.filter((d) => d !== '')
  const duplicates = useMemo(() => new Set(filled.filter((d, i) => filled.indexOf(d) !== i)), [filled])
  const priceNumber = Number(price)

  const errors = {
    student: !student ? 'יש לבחור תלמידה' : undefined,
    price: !price || Number.isNaN(priceNumber) || priceNumber < 1 || priceNumber > 10000 ? 'המחיר לטיפול חייב להיות בין 1 ל-10,000' : undefined,
    service: !service.trim() ? 'יש למלא תיאור שירות' : undefined,
    dates:
      filled.length === 0
        ? 'יש להזין לפחות תאריך טיפול אחד'
        : duplicates.size > 0
          ? 'יש תאריך שמופיע פעמיים'
          : filled.some((d) => d > today)
            ? 'אי אפשר להזין תאריך עתידי'
            : undefined,
  }
  const hasErrors = Object.values(errors).some(Boolean)
  const show = (message?: string) => (touched ? message : undefined)

  async function fillFromAttendance() {
    if (!student) return
    setFilling(true)
    try {
      const attended = await studentsApi.attendedDates(student.id)
      const past = attended.filter((d) => d <= today).sort()
      const skipped = attended.length - past.length
      if (past.length === 0) {
        toast.error('אין תאריכי נוכחות', skipped > 0 ? 'יש נוכחות רק בשיעורים עתידיים' : 'לא נמצאו שיעורים שבהם התלמידה נכחה')
        return
      }
      const list = past.slice(-MAX_DATES)
      setDates(list)
      toast.success('התאריכים מולאו', `${list.length} שיעורים שבהם התלמידה נכחה${skipped > 0 ? ` (${skipped} תאריכים עתידיים לא נכללו)` : ''}`)
    } catch (err) {
      const e = err instanceof ApiError ? err : new ApiError(0, null)
      toast.error('לא הצלחנו להביא את הנוכחות', e.message, e.traceId)
    } finally {
      setFilling(false)
    }
  }

  const setDate = (index: number, value: string) => setDates((list) => list.map((d, i) => (i === index ? value : d)))
  const removeDate = (index: number) => setDates((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : ['']))
  const addDate = () => setDates((list) => (list.length < MAX_DATES ? [...list, ''] : list))

  const mutation = useMutation({
    mutationFn: () =>
      reportsApi.create({
        studentId: student!.id,
        treatmentType,
        pricePerTreatment: priceNumber,
        serviceDescription: service.trim(),
        insuranceCompany: insurance.trim() || null,
        lessonDates: [...filled].sort(),
      }),
    onSuccess: async (report) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['student', report.studentId, 'reports'] })
      try {
        const name = await downloadReportPdf(report.id)
        toast.success('הדוח נשמר והורד', name)
      } catch (err) {
        const e = err instanceof ApiError ? err : new ApiError(0, null)
        toast.error('הדוח נשמר, אבל ההורדה נכשלה', `אפשר להוריד אותו מרשימת הדוחות. ${e.message}`, e.traceId)
      }
      navigate(`/students/${report.studentId}`)
    },
    onError: (err) => setServerError(err instanceof ApiError ? err : new ApiError(0, null)),
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    setServerError(null)
    if (!hasErrors) mutation.mutate()
  }

  if (settings.isPending || (presetId !== null && preset.isPending)) return <Loading />

  const serverFieldErrors = serverError ? Object.values(serverError.fieldErrors).flat() : []

  return (
    <>
      <Link to="/reports" className="font-medium text-water hover:underline">
        → חזרה לדוחות
      </Link>
      <PageHeader title="דוח חדש לקופה" subtitle="הדוח נשמר במערכת ומורד כקובץ PDF" />

      <form className="grid gap-5 lg:grid-cols-2" onSubmit={submit} noValidate>
        <div className="card flex min-w-0 flex-col gap-4 p-4">
          <h2 className="text-lg font-bold text-brand">פרטי הדוח</h2>
          <div>
            <span className="field-label">תלמידה *</span>
            <StudentPicker value={student} onChange={(s) => setStudent(s)} error={show(errors.student)} autoFocus={!presetId} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="n-type">
                סוג טיפול
              </label>
              <select id="n-type" className="input" value={treatmentType} onChange={(e) => changeTreatment(e.target.value as TreatmentType)}>
                {Object.entries(treatmentLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="n-price">
                מחיר לטיפול (₪) *
              </label>
              <input id="n-price" className={`input ${show(errors.price) ? 'input-error' : ''}`} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
              {show(errors.price) && <p className="mt-1 text-sm text-danger">{errors.price}</p>}
            </div>
          </div>
          <p className="-mt-2 text-[13px] text-muted">
            {treatmentType === 'Individual' && settings.data?.defaultIndividualPrice == null
              ? 'לא הוגדר מחיר ברירת מחדל לטיפול פרטני. יש להזין מחיר.'
              : 'המחיר ממולא לפי ברירת המחדל של סוג הטיפול, ואפשר לשנות אותו.'}
          </p>
          <div>
            <label className="field-label" htmlFor="n-service">
              תיאור השירות *
            </label>
            <input id="n-service" className={`input ${show(errors.service) ? 'input-error' : ''}`} value={service} onChange={(e) => setService(e.target.value)} maxLength={100} />
            {show(errors.service) && <p className="mt-1 text-sm text-danger">{errors.service}</p>}
          </div>
          <div>
            <label className="field-label" htmlFor="n-insurance">
              גורם משלם (לא חובה)
            </label>
            <input id="n-insurance" className="input" placeholder={student ? `ריק = ${healthFundLabels[student.healthFund]}` : 'ריק = קופת החולים של התלמידה'} value={insurance} onChange={(e) => setInsurance(e.target.value)} maxLength={100} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#cfe5ef] bg-water-tint p-3.5">
            <span className="tabular">
              <b>{filled.length}</b> טיפולים · סה"כ <b>{formatMoney(errors.price ? 0 : filled.length * priceNumber)}</b>
            </span>
            <button className="btn-primary" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'שומר...' : 'שמור והורד PDF'}
            </button>
          </div>
          {serverError && (
            <div className="rounded-[10px] bg-danger-tint px-3 py-2 text-sm text-[#8e1c1c]">
              <div>{serverError.message}</div>
              {serverFieldErrors.map((m) => (
                <div key={m}>• {m}</div>
              ))}
              {serverError.traceId && <div className="mt-1 text-xs opacity-75">מספר מעקב: {serverError.traceId}</div>}
            </div>
          )}
        </div>

        <div className="card min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-3.5">
            <h2 className="text-lg font-bold text-brand">תאריכי הטיפולים</h2>
            <button type="button" className="btn-ghost btn-sm" disabled={!student || filling} onClick={fillFromAttendance} title={!student ? 'יש לבחור תלמידה קודם' : undefined}>
              {filling ? 'ממלא...' : 'מלא לפי הנוכחות'}
            </button>
          </div>
          <ol className="flex flex-col gap-2 p-3.5">
            {dates.map((date, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-7 text-left text-sm text-muted tabular">{i + 1}.</span>
                <input
                  type="date"
                  aria-label={`תאריך טיפול ${i + 1}`}
                  className={`input flex-1 ${touched && date && (duplicates.has(date) || date > today) ? 'input-error' : ''}`}
                  value={date}
                  max={today}
                  onChange={(e) => setDate(i, e.target.value)}
                />
                <button type="button" className="btn-ghost btn-sm" onClick={() => removeDate(i)} aria-label={`הסרת תאריך ${i + 1}`}>
                  הסרה
                </button>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 pb-3.5">
            <button type="button" className="btn-ghost btn-sm" onClick={addDate} disabled={dates.length >= MAX_DATES}>
              + הוספת תאריך
            </button>
            <span className="text-[13px] text-muted">שורות ריקות לא נשמרות. עד {MAX_DATES} תאריכים בדוח אחד.</span>
          </div>
          {show(errors.dates) && <p className="px-3.5 pb-3.5 text-sm text-danger">{errors.dates}</p>}
        </div>
      </form>
    </>
  )
}
