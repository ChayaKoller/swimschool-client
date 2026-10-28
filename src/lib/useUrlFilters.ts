
import { useSearchParams } from "react-router";
export default function useUrlFilters<T extends Record<string, string>>(defaults: T) {
    const [searchParams, setSearchParams] = useSearchParams();
    const values = Object.fromEntries(
        Object.entries(defaults).map(([key, defaultValue]) => [
            key,
            searchParams.get(key) ?? defaultValue
        ])
    ) as T;

    const rawPage = Number(searchParams.get("page") ?? "1");

    const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
    const setFilter = (key: keyof T & string, value: string) => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);

                if (value === "" || value === defaults[key]) {
                    next.delete(key);
                } else {
                    next.set(key, value);
                }

                next.delete("page");

                return next;
            },
            { replace: true }
        );
    };
   const setPage = (page: number) => {
  setSearchParams((prev) => {
    const next = new URLSearchParams(prev);

    if (page <= 1) {
      next.delete("page");
    } else {
      next.set("page", String(page));
    }

    return next;
  });
};
const clearFilters = () => {
  setSearchParams((prev) => {
    const next = new URLSearchParams(prev);

    Object.keys(defaults).forEach((key) => {
      next.delete(key);
    });

    next.delete("page");

    return next;
  }, { replace: true });
};
const hasFilters = Object.keys(defaults).some((key) => values[key] !== defaults[key]);
    return {
  values,
  page,
  setFilter,
  setPage,
  clearFilters,
  hasFilters
};
}