import { isFuture } from "./format";

type BadgeTone = "success" | "warning" | "neutral";


export function lessonStatus(lesson: { startTime: string; tookPlace: boolean }): { tone: BadgeTone; label: string } {
  if (isFuture(lesson.startTime)) return { tone: "neutral", label: "עתידי" };
  if (lesson.tookPlace) return { tone: "success", label: "התקיים" };
  return { tone: "warning", label: "טרם סומן" };
}
export function cellKey(enrollmentId:number, lessonId:number){
    return `${enrollmentId}:${lessonId}`
}
export function nextMark(current: boolean | null, original: boolean | null): boolean | null {
  if (current === null) return true;
  if (current) return false;
  return original === null ? null : true;
}