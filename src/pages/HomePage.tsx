import clsx from "clsx";
import HomeShortcuts from "../components/home/HomeShortcuts";
import HomeStats from "../components/home/HomeStats";
import TodayLessons from "../components/home/TodayLessons";
import PoolBadge from "../components/ui/PoolBadge";
import PoolIllustration from "../components/ui/PoolIllustration";
import { useAuth } from "../context/useAuth";
import { formatDate, formatWeekday, todayIsrael } from "../lib/format";
 
export default function HomePage() {
  const { user } = useAuth();
  if (!user) return null;
 
  const isTeacher = user.role === "Teacher";
 
  return (
    <div className="flex flex-col gap-5 lg:h-[calc(100dvh-8rem)] lg:min-h-[36rem]">
      <title>בית · האקווריום</title>
 
      {/* פס הברכה */}
      <section className="relative shrink-0 overflow-hidden rounded-card border-[1.5px] border-line bg-[linear-gradient(115deg,#8fd6e7_0%,#c9eef6_55%,#f9d3e3_100%)] px-6 pt-6 pb-10 animate-surface">
        <div className="relative z-10 max-w-[62%]">
          <h1 className="font-brand text-3xl leading-tight font-bold text-line animate-inflate md:text-4xl">
            שלום, <span className="text-inflated bg-inflate">{user.fullName}</span>
          </h1>
          <p className="mt-2 text-sm font-semibold text-line/80 animate-fade-up [animation-delay:0.4s] md:text-base">
            {formatWeekday(new Date().toISOString())}, <span className="tabular-nums">{formatDate(todayIsrael())}</span>
          </p>
        </div>
 
        {/* הטבעת הצבעונית בצד השני של הפס, ווי קטן שצף לידה */}
        <PoolIllustration className="pointer-events-none absolute end-5 top-1/2 z-10 w-20 -translate-y-1/2 drop-shadow-[0_8px_10px_rgb(20_30_60/0.2)] md:end-16 md:w-28" />
        <PoolBadge kind="check" className="pointer-events-none absolute end-44 top-4 z-10 hidden w-8 animate-bob [--tilt:-6deg] md:block" />
 
        {/* גל שזז לאט בתחתית הפס */}
        <svg
          aria-hidden="true"
          viewBox="0 0 2880 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 h-10 w-[200%] animate-wave-slow fill-white/45"
        >
          <path d="M0 60 Q 360 10 720 60 T 1440 60 T 2160 60 T 2880 60 V120 H0 Z" />
        </svg>
      </section>
 
      {/* שני טורים במחשב: פעולות ומספרים, ומשמאל השיעורים של היום */}
      <div
        className={clsx(
          "grid min-h-0 flex-1 gap-5",
          isTeacher && "lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]",
        )}
      >
        <div className="flex flex-col gap-5 animate-fade-up [animation-delay:0.15s]">
          <HomeShortcuts role={user.role} />
          <HomeStats />
        </div>
 
        {isTeacher && <TodayLessons />}
      </div>
    </div>
  );
}