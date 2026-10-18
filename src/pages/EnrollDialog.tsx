import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client'
import { enrollmentsApi } from '../api/endpoints'
import type { GroupDetails, StudentListItem } from '../api/types'
import Modal from '../components/Modal'
import StudentPicker from '../components/StudentPicker'
import { useToast } from '../components/Toast'

// The limited resource: a spot in the group. 409 errors are shown clearly and the group is refreshed.
export default function EnrollDialog({ group, onClose }: { group: GroupDetails; onClose: () => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [student, setStudent] = useState<StudentListItem | null>(null)
  const [amountDue, setAmountDue] = useState(String(group.price))
  const [error, setError] = useState<ApiError | null>(null)

  const refreshGroup = () => {
    queryClient.invalidateQueries({ queryKey: ['group', group.id] })
    queryClient.invalidateQueries({ queryKey: ['groups'] })
    queryClient.invalidateQueries({ queryKey: ['students'] })
  }

  const mutation = useMutation({
    mutationFn: () => enrollmentsApi.enroll({ studentId: student!.id, groupId: group.id, amountDue: amountDue === '' ? null : Number(amountDue) }),
    onSuccess: (enrollment) => {
      refreshGroup()
      queryClient.invalidateQueries({ queryKey: ['student', enrollment.studentId] })
      toast.success('התלמידה נרשמה', `${enrollment.studentName} נרשמה לקבוצה ${enrollment.groupName}`)
      onClose()
    },
    onError: (err) => {
      const apiError = err instanceof ApiError ? err : new ApiError(0, null)
      if (apiError.status === 409) {
        // Someone else may have taken the last spot: show the current state of the group
        refreshGroup()
        if (apiError.code === 'GROUP_FULL' || apiError.code === 'SPOT_TAKEN') {
          toast.error(apiError.code === 'SPOT_TAKEN' ? 'המקום נתפס' : 'אי אפשר לרשום', apiError.message, apiError.traceId)
          onClose()
          return
        }
      }
      setError(apiError)
    },
  })

  const amountInvalid = amountDue !== '' && (Number.isNaN(Number(amountDue)) || Number(amountDue) < 0)

  function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!student || amountInvalid) return
    mutation.mutate()
  }

  return (
    <Modal title={`רישום תלמידה לקבוצה ${group.name}`} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <div>
          <span className="field-label">תלמידה</span>
          <StudentPicker value={student} onChange={setStudent} excludeIds={group.students.map((s) => s.id)} autoFocus />
        </div>
        <div>
          <label className="field-label" htmlFor="amountDue">
            סכום לתשלום (₪)
          </label>
          <input id="amountDue" className={`input ${amountInvalid || error?.fieldError('AmountDue') ? 'input-error' : ''}`} inputMode="decimal" value={amountDue} onChange={(e) => setAmountDue(e.target.value)} />
          <p className="mt-1 text-[13px] text-muted">הסכום ממולא לפי מחיר הקבוצה, ואפשר לשנות אותו (הנחה).</p>
          {amountInvalid && <p className="mt-1 text-sm text-danger">יש להזין סכום תקין</p>}
        </div>
        {error && (
          <div className="rounded-[10px] bg-danger-tint px-3 py-2 text-sm text-[#8e1c1c]">
            {error.message}
            {error.traceId && <div className="mt-1 text-xs opacity-75">מספר מעקב: {error.traceId}</div>}
          </div>
        )}
        <div className="flex flex-wrap gap-2.5">
          <button className="btn-primary" type="submit" disabled={!student || amountInvalid || mutation.isPending}>
            {mutation.isPending ? 'רושם...' : 'רישום'}
          </button>
          <button className="btn-ghost" type="button" onClick={onClose}>
            ביטול
          </button>
        </div>
      </form>
    </Modal>
  )
}
