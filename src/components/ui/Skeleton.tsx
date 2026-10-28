type SkeletonProps = {
  rows?: number;
};

// רוחב שונה לכל עמודה, כדי שהשלד ייראה כמו טבלה אמיתית ולא כמו פסים זהים
const barWidths = ["w-32", "w-24", "w-28", "w-16", "w-20"];

export default function Skeleton({ rows = 5 }: SkeletonProps) {
  return (
    <div role="status" className="overflow-hidden rounded-card border-[1.5px] border-line bg-white">
      <div aria-hidden="true" className="animate-pulse">
        <div className="h-11 border-b-[1.5px] border-line bg-page/60" />

        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-6 border-b border-line/10 px-4 py-4 last:border-b-0">
            {barWidths.map((width, column) => (
              <div
                key={width}
                className={`h-3 rounded-full bg-ink/10 ${width} ${column > 1 ? "hidden sm:block" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>

      <span className="sr-only">טוען נתונים...</span>
    </div>
  );
}