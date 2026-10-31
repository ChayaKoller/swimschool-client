import dayjs from "dayjs";

// מועדים שחוזרים כל שבוע.
// starts: המועד הראשון בכל יום בשבוע (אחד או שניים, לפי הסדר).
// count: כמה מועדים בסך הכול. הסבב: יום 1, יום 2, ושבוע אחר כך שוב יום 1, יום 2...
export function recurringDates(starts: string[], count: number, format: string): string[] {
  if (starts.length === 0 || starts.some((start) => !start)) return [];
  if (!Number.isInteger(count) || count < 1) return [];

  return Array.from({ length: count }, (_, i) =>
    dayjs(starts[i % starts.length])
      .add(Math.floor(i / starts.length), "week")
      .format(format),
  );
}

// היום השני חייב להיות אחרי הראשון ובאותו שבוע, אחרת הסדר מתבלבל
export function secondDayError(first: string, second: string): string | null {
  if (!first || !second) return null;
  const days = dayjs(second).startOf("day").diff(dayjs(first).startOf("day"), "day");
  if (days < 1 || days > 6) {
    return "היום השני צריך להיות אחרי היום הראשון, באותו שבוע (עד 6 ימים אחריו)";
  }
  return null;
}
