import type { HealthFund, Season, TreatmentType, UserRole } from '../api/types'

const TIME_ZONE = 'Asia/Jerusalem'

export const healthFundLabels: Record<HealthFund, string> = {
  Maccabi: 'מכבי',
  Clalit: 'כללית',
  Meuhedet: 'מאוחדת',
  Leumit: 'לאומית',
}

export const seasonLabels: Record<Season, string> = {
  Winter: 'חורף',
  Spring: 'אביב',
  Summer: 'קיץ',
  Autumn: 'סתיו',
}

export const treatmentLabels: Record<TreatmentType, string> = {
  Group: 'טיפול בקבוצה',
  Individual: 'טיפול פרטני',
}

export const roleLabels: Record<UserRole, string> = {
  Teacher: 'מורה',
  Secretary: 'מזכירה',
}

const money = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 2 })
export const formatMoney = (value: number) => money.format(value)

// Server lesson times are UTC; show them in Israel time
const dateTime = new Intl.DateTimeFormat('he-IL', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso))

const dateOnly = new Intl.DateTimeFormat('he-IL', { timeZone: TIME_ZONE, day: '2-digit', month: '2-digit', year: 'numeric' })
export const formatDate = (iso: string) => dateOnly.format(new Date(iso))

// "2026-10-19" (DateOnly from the server) -> "19.10.2026", without time zone shifts
export function formatDay(day: string): string {
  const [y, m, d] = day.split('-')
  return `${d}.${m}.${y}`
}

// Today's date in Israel as "yyyy-mm-dd" (for date inputs and the "no future dates" rule)
export function israelToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date())
}
