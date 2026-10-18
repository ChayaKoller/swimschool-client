# האקווריום: צד הלקוח

ממשק ניהול לבית הספר לשחייה: התחברות, קבוצות ורישום, תלמידות ודוחות לקופות עם הורדת PDF.
React + TypeScript + Vite + Tailwind CSS. עובד מול שרת ה-SwimSchool (.NET).

## מה יש במערכת
| מסך | מה אפשר לעשות | הקריאות לשרת |
|---|---|---|
| כניסה | התחברות עם אימייל וסיסמה. חיבור שפג תוקפו מחזיר לכאן עם הודעה | `POST /api/auth/login`, `GET /api/auth/me` |
| קבוצות | חיפוש לפי שם, סינון לפי עונה ומצב, עמודים | `GET /api/groups` |
| פרטי קבוצה | תלמידות, תשלומים, שיעורים קרובים, ורישום תלמידה עם סכום שאפשר לשנות (הנחה). כשהמקום נתפס מוצגת הודעה והקבוצה מתרעננת | `GET /api/groups/{id}`, `POST /api/enrollments` |
| תלמידות | חיפוש, "לא שילמו", "נעדרו יותר מפעמיים", ארכיון, והוספת תלמידה | `GET /api/students`, `POST /api/students` |
| פרטי תלמידה | פרטים, קבוצות ותשלומים, הדוחות שלה עם הורדה, ו"דוח חדש" | `GET /api/students/{id}`, `GET /api/students/{id}/reports` |
| דוחות לקופות | חיפוש לפי שם או ת"ז, קופה וטווח תאריכים. הורדה ותצוגה מקדימה לכל דוח | `GET /api/reports`, `GET /api/reports/{id}/pdf` |
| דוח חדש | מחיר לפי סוג הטיפול, שדות תאריך למילוי, "מלא לפי הנוכחות", ו"שמור והורד PDF" | `GET /api/report-settings`, `GET /api/students/{id}/attended-dates`, `POST /api/reports` |

## הרצה במחשב
**צריך:** Node.js בגרסה 20.19 ומעלה (מומלץ גרסת LTS מ-nodejs.org).

1. מריצים את השרת ב-Visual Studio עם הפרופיל **http** (הכתובת `http://localhost:5136`).
2. פותחים את תיקיית הלקוח ב-Visual Studio (File → Open → Folder) או בטרמינל.
3. בטרמינל, בתיקיית הלקוח:
   ```
   npm install
   npm run dev
   ```
4. פותחים בדפדפן את `http://localhost:5173`.

**למה אין צורך ב-CORS בפיתוח:** הלקוח שולח כל קריאה ל-`/api` לשרת הפיתוח של Vite, והוא מעביר אותה לשרת ה-.NET. לכן הדפדפן רואה כתובת אחת.

**השרת רץ בכתובת אחרת?** מעתיקים את `.env.example` ל-`.env` ומשנים את `VITE_PROXY_TARGET`.
למשל לפרופיל https: `VITE_PROXY_TARGET=https://localhost:7049`.

**משתמשי דמו** (נוצרים ב-Development): `dana.levi@example.com` (מורה), `yael.mizrahi@example.com` (מזכירה). הסיסמה היא הערך של `DevSeed:Password` ב-User Secrets של השרת.

## פקודות
| פקודה | מה עושה |
|---|---|
| `npm run dev` | הרצה לפיתוח |
| `npm run build` | בדיקת טיפוסים ובנייה לתיקיית `dist` |
| `npm run preview` | הצגת הגרסה הבנויה |

## העלאה לענן (Render, Static Site)
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment:** `VITE_API_URL` = כתובת השרת בענן, למשל `https://swimschool-api.onrender.com`
- **Redirects/Rewrites:** Source `/*`, Destination `/index.html`, Action `Rewrite` (כדי שרענון בדף פנימי לא יחזיר 404)
- **בשרת:** להוסיף את כתובת הלקוח למשתנה `Cors__AllowedOrigins__0`.

## מבנה התיקיות
```
src/
  api/          חיבור לשרת: client.ts (Token, שגיאות), endpoints.ts (הקריאות), types.ts (ה-DTOs)
  auth/         ההתחברות ושמירת המשתמשת המחוברת
  components/   רכיבים משותפים: מסגרת, הודעות, חלון, טבלת דוחות, בחירת תלמידה
  pages/        המסכים
  lib/          עיצוב תאריכים, כסף ותוויות בעברית, והורדת PDF
  index.css     הצבעים של הלוגו (Theme) ורכיבי העיצוב
```

## טיפול בשגיאות
השרת מחזיר `ErrorResponse` עם `code` והודעה בעברית. הלקוח מציג את ההודעה כמו שהיא, ובשגיאה לא צפויה גם את מספר המעקב (`traceId`), כדי שאפשר יהיה למצוא אותה בלוג של השרת.
ב-409 של רישום (`GROUP_FULL`, `SPOT_TAKEN`) הקבוצה מתרעננת מיד, כך שרואים את המצב העדכני.
