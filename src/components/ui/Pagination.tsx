import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="מעבר בין עמודים" className="mt-5 flex items-center justify-center gap-3 sm:gap-4">
      <Button
        variant="secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        icon={<ChevronRight />}
        className="px-3 sm:px-5"
      >
        הקודם
      </Button>

      <span aria-live="polite" className="text-sm whitespace-nowrap text-slate-600 tabular-nums">
        עמוד <span className="font-bold text-line">{page}</span> מתוך{" "}
        <span className="font-bold text-line">{totalPages}</span>
      </span>

      <Button
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 sm:px-5"
      >
        הבא
        <ChevronLeft />
      </Button>
    </nav>
  );
}