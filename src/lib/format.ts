import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/he";

dayjs.extend(utc);
dayjs.extend(timezone);

const ISRAEL_TZ = "Asia/Jerusalem";

const moneyFormatter = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

// זמן UTC מהשרת -> אותו רגע בשעון ישראל
function toIsrael(utcValue: string) {
  return dayjs.utc(utcValue).tz(ISRAEL_TZ);
}

// "2026-10-19" -> "19/10/2026" (תאריך בלבד, בלי המרת שעון)
export function formatDate(date: string): string {
  return dayjs(date).format("DD/MM/YYYY");
}

// "2026-11-01T15:00:00Z" -> "01/11/2026 17:00"
export function formatDateTime(utcValue: string): string {
  return toIsrael(utcValue).format("DD/MM/YYYY HH:mm");
}

// "2026-11-01T15:00:00Z" -> "17:00"
export function formatTime(utcValue: string): string {
  return toIsrael(utcValue).format("HH:mm");
}

// "2026-11-01T15:00:00Z" -> "יום ראשון"
export function formatWeekday(utcValue: string): string {
  return toIsrael(utcValue).locale("he").format("[יום] dddd");
}

// זמן UTC מהשרת -> ערך לשדה datetime-local בשעון ישראל: "2026-11-01T17:00"
export function toLocalInput(utcValue: string): string {
  return toIsrael(utcValue).format("YYYY-MM-DDTHH:mm");
}

// ערך משדה datetime-local -> מה ששולחים לשרת: שעון ישראל, בלי Z
export function toServerLocal(localValue: string): string {
  return dayjs(localValue).format("YYYY-MM-DDTHH:mm");
}

// התאריך של היום בישראל: "2026-10-21"
export function todayIsrael(): string {
  return dayjs().tz(ISRAEL_TZ).format("YYYY-MM-DD");
}

// 90 -> "‏90 ₪"
export function formatMoney(amount: number): string {
  return moneyFormatter.format(amount);
}
export function ageFrom(birthDate: string): number {
  return dayjs().diff(dayjs(birthDate), "year");
}

const LESSON_FORMAT = "[יום] dddd, DD/MM/YYYY HH:mm";

// "2026-11-01T15:00:00Z" -> "יום ראשון, 01/11/2026 17:00"
export function formatLessonTime(utcValue: string): string {
  return toIsrael(utcValue).locale("he").format(LESSON_FORMAT);
}

// "2026-11-01T17:00" (כבר בשעון ישראל) -> "יום ראשון, 01/11/2026 17:00"
export function formatLocalLessonTime(localValue: string): string {
  return dayjs(localValue).locale("he").format(LESSON_FORMAT);
}

export function isFuture(utcValue: string): boolean {
  return dayjs.utc(utcValue).isAfter(dayjs());
}
export function formatShortDate(utcValue:string): string {
  return toIsrael(utcValue).format("DD/MM");
}

export function formatWeekRange(): string {
  const today = dayjs().tz(ISRAEL_TZ);
  return `${today.format("DD/MM")} עד ${today.add(6, "day").format("DD/MM")}`;
}
