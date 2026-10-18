import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client'
import { studentsApi } from '../api/endpoints'
import type { HealthFund } from '../api/types'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { healthFundLabels, israelToday } from '../lib/format'

const empty = { identityNumber: '', fullName: '', phone: '', email: '', birthDate: '', healthFund: '' as HealthFund | '', placementRequest: '' }
type Form = typeof empty

// Checks in the browser that match the server rules, so most mistakes show before sending
function validate(form: Form): Partial<Record<keyof Form, string>> {
  const errors: Partial<Record<keyof Form, string>> = {}
  if (!/^\d{9}$/.test(form.identityNumber)) errors.identityNumber = 'תעודת זהות: 9 ספרות'
  if (!form.fullName.trim()) errors.fullName = 'יש למלא שם מלא'
  if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone.trim())) errors.phone = 'יש למלא מספר טלפון תקין'
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'כתובת אימייל לא תקינה'
  if (!form.birthDate) errors.birthDate = 'יש לבחור תאריך לידה'
  else if (form.birthDate >= israelToday()) errors.birthDate = 'תאריך הלידה חייב להיות בעבר'
  if (!form.healthFund) errors.healthFund = 'יש לבחור קופת חולים'
  return errors
}

export default function NewStudentDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [form, setForm] = useState<Form>(empty)
  const [touched, setTouched] = useState(false)
  const [serverError, setServerError] = useState<ApiError | null>(null)

  const errors = touched ? validate(form) : {}
  const set = (key: keyof Form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const fieldError = (key: keyof Form) => errors[key] ?? serverError?.fieldError(key)

  const mutation = useMutation({
    mutationFn: () =>
      studentsApi.create({
        identityNumber: form.identityNumber,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        birthDate: form.birthDate,
        healthFund: form.healthFund as HealthFund,
        placementRequest: form.placementRequest.trim() || null,
      }),
    onSuccess: (student) => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast.success('התלמידה נוספה', student.fullName)
      onClose()
      navigate(`/students/${student.id}`)
    },
    onError: (err) => setServerError(err instanceof ApiError ? err : new ApiError(0, null)),
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    setServerError(null)
    if (Object.keys(validate(form)).length === 0) mutation.mutate()
  }

  const input = (key: keyof Form, label: string, props: Record<string, unknown> = {}) => (
    <div>
      <label className="field-label" htmlFor={`s-${key}`}>
        {label}
      </label>
      <input id={`s-${key}`} className={`input ${fieldError(key) ? 'input-error' : ''}`} value={form[key]} onChange={set(key)} {...props} />
      {fieldError(key) && <p className="mt-1 text-sm text-danger">{fieldError(key)}</p>}
    </div>
  )

  return (
    <Modal title="תלמידה חדשה" onClose={onClose} wide>
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          {input('fullName', 'שם מלא *', { autoFocus: true })}
          {input('identityNumber', 'תעודת זהות *', { inputMode: 'numeric', maxLength: 9 })}
          {input('phone', 'טלפון *', { inputMode: 'tel', dir: 'ltr', className: `input text-right ${fieldError('phone') ? 'input-error' : ''}` })}
          {input('email', 'אימייל (לא חובה)', { type: 'email', dir: 'ltr', className: `input text-right ${fieldError('email') ? 'input-error' : ''}` })}
          {input('birthDate', 'תאריך לידה *', { type: 'date', max: israelToday() })}
          <div>
            <label className="field-label" htmlFor="s-healthFund">
              קופת חולים *
            </label>
            <select id="s-healthFund" className={`input ${fieldError('healthFund') ? 'input-error' : ''}`} value={form.healthFund} onChange={set('healthFund')}>
              <option value="">בחירה</option>
              {Object.entries(healthFundLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {fieldError('healthFund') && <p className="mt-1 text-sm text-danger">{fieldError('healthFund')}</p>}
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="s-placement">
            בקשת שיבוץ (לא חובה)
          </label>
          <textarea id="s-placement" className="input min-h-20" placeholder="למשל: קבוצה מתקדמת, שעה מסוימת" value={form.placementRequest} onChange={set('placementRequest')} maxLength={500} />
        </div>
        {serverError && (
          <div className="rounded-[10px] bg-danger-tint px-3 py-2 text-sm text-[#8e1c1c]">
            {serverError.message}
            {serverError.traceId && <div className="mt-1 text-xs opacity-75">מספר מעקב: {serverError.traceId}</div>}
          </div>
        )}
        <div className="flex flex-wrap gap-2.5">
          <button className="btn-primary" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'שומר...' : 'שמירה'}
          </button>
          <button className="btn-ghost" type="button" onClick={onClose}>
            ביטול
          </button>
        </div>
      </form>
    </Modal>
  )
}
