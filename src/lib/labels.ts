
import type { HealthFund, Season, TreatmentType, UserRole } from "../types/typesDtos";

export const healthFundLabels = {
  Maccabi: "מכבי",
  Clalit: "כללית",
  Meuhedet: "מאוחדת",
  Leumit: "לאומית",
} satisfies Record<HealthFund, string>;

export const seasonLabels = {
  Winter: "חורף",
  Spring: "אביב",
  Summer: "קיץ",
  Autumn: "סתיו",
} satisfies Record<Season, string>;

export const treatmentTypeLabels = {
  Group: "קבוצתי",
  Individual: "פרטני",
} satisfies Record<TreatmentType, string>;

export const roleLabels = {
  Teacher: "מורה",
  Secretary: "מזכירה",
} satisfies Record<UserRole, string>;

export type Option<T extends string = string> = { value: T; label: string };

// { Maccabi: "מכבי", ... } -> [{ value: "Maccabi", label: "מכבי" }, ...]
export function toOptions<T extends string>(labels: Record<T, string>): Option<T>[] {
  return (Object.keys(labels) as T[]).map((value) => ({
    value,
    label: labels[value],
  }));
}
export function isSeason(value: string): value is Season {
  return value in seasonLabels;
}
export function isHealthFund(value: string): value is HealthFund {
  return value in healthFundLabels;
}
