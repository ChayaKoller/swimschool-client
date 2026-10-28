import { z } from "zod";
import { todayIsrael } from "./format";

export const REQUIRED = "שדה חובה";

// טקסט חובה: מוריד רווחים בהתחלה ובסוף, ולא ריק
export const requiredText = (max: number) => z
  .string()
  .trim()
  .min(1, { error: REQUIRED })
  .max(max, { error: `עד ${max} תווים` });

// טקסט רשות: ריק הופך ל-null (השרת מצפה ל-null ולא ל-"")
export const optionalText = (max: number) => z
  .string()
  .trim()
  .max(max, { error: `עד ${max} תווים` })
  .transform((value) => value || null);

// ת"ז: בדיוק 9 ספרות
export const identityNumber = z.string().trim().regex(/^\d{9}$/, { error: 'ת"ז צריכה להכיל 9 ספרות' });



// אימייל רשות: ריק -> null, אחרת אימייל תקין עד 254 תווים
export const optionalEmail = z
  .string()
  .trim()
  .max(254, { error: "עד 254 תווים" })
  .refine((value) => value === "" || z.email().safeParse(value).success, {
    error: "כתובת אימייל לא תקינה",
  })
  .transform((value) => value || null);

// אימייל חובה (כניסה, מזכירה)
export const requiredEmail = z
  .string()
  .trim()
  .min(1, { error: REQUIRED })
  .max(254, { error: "עד 254 תווים" })
  .refine((value) => z.email().safeParse(value).success, {
    error: "כתובת אימייל לא תקינה",
  });

// סיסמה: 8 עד 128, לפחות אות אחת ולפחות ספרה אחת
export const password = z
  .string()
  .min(8, { error: "לפחות 8 תווים" })
  .max(128, { error: "עד 128 תווים" })
  .regex(/\p{L}/u, { error: "צריכה להכיל לפחות אות אחת" })
  .regex(/\d/, { error: "צריכה להכיל לפחות ספרה אחת" });

// סכום: מספר, 0 ומעלה. בטופס: register("amount", { valueAsNumber: true })
export const amount = z
  .number({ error: "יש להזין סכום" })
  .min(0, { error: "הסכום לא יכול להיות שלילי" });

// תאריך בעבר, בפורמט "YYYY-MM-DD" (מה ששדה type="date" נותן)
export const pastDate = z
  .string()
  .min(1, { error: REQUIRED })
  .refine((value) => value < todayIsrael(), {
    error: "התאריך צריך להיות בעבר",
  });
export const wholeNumber = (min: number, max: number) =>
  z.number({ error: "יש להזין מספר" })
    .int({ error: "מספר שלם בלבד" })
    .min(min, { error: `בין ${min} ל-${max}` })
    .max(max, { error: `בין ${min} ל-${max}` });
// מחיר לטיפול בדוח ובהגדרות: 1 עד 10,000 (כמו בשרת). בטופס: valueAsNumber
export const treatmentPrice = z
  .number({ error: "יש להזין מחיר" })
  .min(1, { error: "המחיר צריך להיות בין 1 ל-10,000" })
  .max(10000, { error: "המחיר צריך להיות בין 1 ל-10,000" });
// טלפון: חובה, עד 20 תווים, ורק תווים של טלפון (כמו [Phone] בשרת)
export const phone = requiredText(20).regex(/^\+?[\d\s().-]*\d[\d\s().-]*$/, { error: "מספר טלפון לא תקין" });
// שני השדות של סיסמה חדשה: החלפת סיסמה, מזכירה חדשה, וסיסמה חדשה למזכירה
export const newPasswordFields = {
  newPassword: password,
  confirmPassword: z.string().min(1, { error: REQUIRED }),
};

// הבדיקה שהאימות זהה לסיסמה, וההודעה שלה. משתמשים בהם ב-.refine(passwordsMatch, passwordsMismatch)
export function passwordsMatch(values: { newPassword: string; confirmPassword: string }) {
  return values.newPassword === values.confirmPassword;
}
export const passwordsMismatch = { error: "הסיסמאות אינן תואמות", path: ["confirmPassword"] };