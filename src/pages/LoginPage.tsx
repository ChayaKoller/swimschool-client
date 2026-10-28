import { zodResolver } from "@hookform/resolvers/zod";
import { Hourglass, LockKeyhole, LogIn, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useLogin } from "../api/auth/hook";
import { loginSchema, type loginSchemaData } from "../api/auth/schema";
import logo from "../assets/sideLogo.png";
import FormError from "../components/form/FormError";
import FormField from "../components/form/FormField";
import PasswordField from "../components/form/PasswordField";
import TextField from "../components/form/TextField";
import { useServerErrors } from "../components/form/useServerErrors";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";
import PoolBadge from "../components/ui/PoolBadge";
import PoolIllustration from "../components/ui/PoolIllustration";
import PoolLanes from "../components/ui/PoolLanes";
import { useAuth } from "../context/useAuth";
import useIsSlow from "../lib/useIsSlow";
 
// בועות שעולות מהקרקעית. כל שורה = בועה אחת (מיקום, גודל, השהיה)
const bubbles = [
  "start-[8%] size-3 [animation-delay:0s]",
  "start-[22%] size-2 [animation-delay:3s]",
  "start-[41%] size-4 [animation-delay:6s]",
  "start-[63%] size-2.5 [animation-delay:1.5s]",
  "start-[78%] size-3.5 [animation-delay:4.5s]",
  "start-[91%] size-2 [animation-delay:8s]",
];
 
const LoginPage = () => {
  const { user, isLoading, signIn, sessionExpired } = useAuth();
  const login = useLogin();
 
  const {
    register,
    handleSubmit,
    resetField,
    setError,
    formState: { errors },
  } = useForm<loginSchemaData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { formError, handleServerError } = useServerErrors(setError);
  const navigate = useNavigate();
  const location = useLocation();
  const isSlow = useIsSlow({ isActive: login.isPending });
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/";
 
  if (isLoading) {
    return <LoadingState label="בודקת חיבור..." />;
  }
  if (user) {
    return <Navigate to={from} replace />;
  }
 
  const onHandleSubmit = (data: loginSchemaData) => {
    login.mutate(data, {
      onSuccess: (response) => {
        signIn(response);
        navigate(from, { replace: true });
      },
      onError: (error) => {
        handleServerError(error);
        resetField("password");
      },
    });
  };
 
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[linear-gradient(180deg,#a6f4fd_0%,#74e6f6_50%,#3fd0ea_100%)] px-4 pt-24 pb-16 md:py-4">
      <title>כניסה · האקווריום</title>
 
      {/* הבריכה: אור רך שזז לאט, בועות וגלים עדינים */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -start-1/4 -top-1/4 size-[70vmax] animate-glow rounded-full bg-[#7be7f7]/45 blur-3xl" />
        <div className="absolute -bottom-1/3 -end-1/4 size-[60vmax] animate-glow rounded-full bg-[#22c4e4]/35 blur-3xl [animation-delay:-8s]" />
 
        {bubbles.map((bubble) => (
          <span
            key={bubble}
            className={`absolute -bottom-6 animate-rise rounded-full border border-white/70 bg-white/25 ${bubble}`}
          />
        ))}
 
        <svg viewBox="0 0 2880 200" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-28 w-[200%] animate-wave-slow fill-[#2fc7e6]/35">
          <path d="M0 110 Q360 50 720 110 T1440 110 T2160 110 T2880 110 V200 H0 Z" />
        </svg>
        <svg viewBox="0 0 2880 200" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-20 w-[200%] animate-wave fill-[#1bb8dc]/40">
          <path d="M0 120 Q360 70 720 120 T1440 120 T2160 120 T2880 120 V200 H0 Z" />
        </svg>
      </div>
 
      {/* במחשב: הטקסט מימין והטופס משמאל. בטלפון: הטופס למעלה והטקסט מתחתיו */}
      <div className="relative grid w-full max-w-5xl items-center gap-10 font-pro md:grid-cols-[1fr_2fr] md:gap-8 lg:gap-12">
        <div className="relative mx-auto w-full max-w-md animate-surface md:order-2 md:max-w-lg">
          {/* אדוות מים שמתפשטות כשהכרטיס "עולה" מהבריכה */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-24 mx-auto size-96 max-w-full animate-ripple rounded-full border-2 border-white/80" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-24 mx-auto size-96 max-w-full animate-ripple rounded-full border-2 border-white/60 [animation-delay:0.35s]" />
 
          {/* הטבעת הצבעונית צפה בפינת הכרטיס, בחלק הריק שליד הלוגו */}
          <PoolIllustration className="pointer-events-none absolute inset-x-0 -top-20 z-10 mx-auto w-24 animate-bob drop-shadow-[0_10px_12px_rgb(20_30_60/0.22)] [--tilt:-4deg] sm:inset-x-auto sm:-end-10 sm:mx-0 sm:w-28 lg:-end-14 lg:-top-16 lg:w-32" />
 
          {/* שלוש תגיות קטנות יחד, מתחת לפינה הימנית התחתונה של הכרטיס. בטלפון הן מוסתרות */}
          <PoolBadge kind="check" className="pointer-events-none absolute -bottom-16 -start-8 hidden w-9 animate-bob [--tilt:-6deg] md:block" />
          <PoolBadge kind="bars" className="pointer-events-none absolute -bottom-20 start-4 hidden w-14 animate-bob [--tilt:5deg] [animation-delay:-2s] md:block" />
          <PoolBadge kind="pie" className="pointer-events-none absolute -bottom-22 start-20 hidden w-9 animate-bob [--tilt:-4deg] [animation-delay:-4s] md:block" />
 
          <section className="relative overflow-hidden rounded-card border-[1.5px] border-line bg-white shadow-[6px_6px_0_var(--color-line)]">
            {/* החלק העליון: לוגו וכותרת על רקע מים בהיר */}
            <div className="border-b-[1.5px] border-line bg-[linear-gradient(180deg,#ffffff_0%,#dff8fc_100%)] px-8 pt-6 pb-5 text-center sm:px-10 md:pt-5 md:pb-4">
              <img src={logo} alt="האקווריום, בית ספר לשחייה" className="mx-auto h-20 w-auto" />
              <h1 className="mt-3 flex animate-inflate flex-col items-center text-5xl [animation-delay:0.5s]">
                <span className="text-inflated bg-[linear-gradient(90deg,#8b3dff_0%,#ff2e88_55%,#ff7a3d_100%)]">שחית</span>
                <span className="text-inflated bg-[linear-gradient(90deg,#3d34d6_0%,#7b4dff_100%)]">בפיס</span>
              </h1>
            </div>
 
            <div className="px-8 pt-5 pb-6 sm:px-10">
              <div className="flex items-center gap-3 rounded-control border border-line px-4 py-2.5">
                <span className="grid size-10 place-items-center rounded-full border-[1.5px] border-line bg-pink text-line">
                  <LogIn aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-line">כניסה למערכת</h2>
                  <p className="text-sm text-slate-500">למורות ולמזכירות של בית הספר</p>
                </div>
              </div>
 
              {sessionExpired && (
                <p
                  role="status"
                  className="mt-4 flex items-center gap-2 rounded-control border-[1.5px] border-coral/50 bg-coral/10 px-4 py-3 text-sm font-medium text-line"
                >
                  <Hourglass aria-hidden="true" className="size-4 shrink-0 text-coral" />
                  החיבור הסתיים, יש להתחבר מחדש
                </p>
              )}
 
              <form onSubmit={handleSubmit(onHandleSubmit)} noValidate className="mt-5 flex flex-col gap-4">
                <FormField label="אימייל" required htmlFor="email" error={errors.email?.message}>
                  <div className="relative">
                    <Mail aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink/50" />
                    <TextField
                      {...register("email")}
                      id="email"
                      type="email"
                      dir="ltr"
                      autoComplete="username"
                      placeholder="name@example.com"
                      invalid={!!errors.email}
                      aria-describedby="email-description"
                      className="h-11 pe-10 text-start"
                    />
                  </div>
                </FormField>
 
                <FormField label="סיסמה" required htmlFor="password" error={errors.password?.message}>
                  <div className="relative">
                    <LockKeyhole aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 z-10 size-4 -translate-y-1/2 text-ink/50" />
                    <PasswordField
                      {...register("password")}
                      id="password"
                      autoComplete="current-password"
                      invalid={!!errors.password}
                      aria-describedby="password-description"
                      className="h-11 ps-10"
                    />
                  </div>
                </FormField>
 
                <FormError message={formError} />
 
                <Button type="submit" isLoading={login.isPending} icon={<LogIn />} className="mt-1 h-12 w-full text-base hover:translate-y-0!">
                  כניסה
                </Button>
 
                {isSlow && (
                  <p role="status" className="text-center text-sm text-primary-text">
                    השרת מתעורר, זה יכול לקחת עד דקה...
                  </p>
                )}
              </form>
            </div>
          </section>
        </div>
 
        {/* הטקסט הפרסומי מתחת לטופס */}
        <article className="relative mx-auto w-full max-w-md rounded-card border-[1.5px] border-line/15 bg-white/55 px-6 py-7 text-line backdrop-blur-md sm:px-8 md:order-1 md:max-w-none md:border-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
          <p className="animate-fade-up text-2xl leading-tight font-extrabold tracking-tight text-balance [animation-delay:0.9s] lg:text-[28px]">
            את רוצה שהיא תדע לשחות, את רוצה להיות בטוחה שהיא תצליח, שהיא תהנה, שתחווה סיפוק והגשמה.{" "}
            <span className="text-pink">אנחנו יודעות.</span>
          </p>
          <p className="mt-5 animate-fade-up text-base leading-relaxed text-slate-700 [animation-delay:1.15s] lg:text-lg">
            באקווריום, עם נסיון של מעל 20 שנה, אנחנו מלוות כל ילדה באופן אישי, מזהות את המבנה שלה, מתאימות לה קצב
            למידה ותרגול, ויודעות גם תוך כדי שחיה, להעניק לה ביטחון והעצמה אינדיבידואלית מדויקת.
          </p>
          <p className="mt-5 animate-fade-up border-s-4 border-pink ps-4 text-base leading-relaxed font-semibold text-line [animation-delay:1.4s] lg:text-lg">
            כי כשמורה מקצועית אחת שוחה איתה עד להצלחה. את יודעת שהיא זכתה.{" "}
            <span className="font-extrabold text-pink">שהיא שחתה.</span>
          </p>
 
          {/* מסלולי השחייה מתחת לטקסט, בצד ימין. בטלפון הם מוסתרים */}
          <PoolLanes className="pointer-events-none mt-8 hidden w-48 animate-bob [--tilt:-2deg] [animation-delay:-3s] md:block lg:w-56" />
        </article>
      </div>
    </main>
  );
};
 
export default LoginPage;