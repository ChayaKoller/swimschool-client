import { z } from "zod";
 
type LessonTimeRow = { value: string };
export const lessonTimesField = z.array(z.object({ value: z.string() }));
export function checkLessonTimes(times: LessonTimeRow[], ctx: z.RefinementCtx) {
  if (times.length === 0) {
    ctx.addIssue({ code: "custom", path: ["lessonTimes"], message: "יש להוסיף לפחות שיעור אחד" });
    return;
  }
 
  const seen = new Set<string>();
  times.forEach((time, index) => {
    const path = ["lessonTimes", index, "value"];
    if (!time.value) {
      ctx.addIssue({ code: "custom", path, message: "יש לבחור תאריך ושעה" });
    } else if (seen.has(time.value)) {
      ctx.addIssue({ code: "custom", path, message: "כבר קיים שיעור בתאריך ובשעה האלה" });
    }
    seen.add(time.value);
  });
}
 
export const addLessonsSchema = z
  .object({
    lessonTimes: lessonTimesField,
    isMakeup: z.boolean(),
  })
  .superRefine((data, ctx) => checkLessonTimes(data.lessonTimes, ctx));

export const moveLessonSchema = z.object({
  startTime: z.string().min(1, { error: "יש לבחור תאריך ושעה" }),
});
export type AddLessonsFormValues = z.infer<typeof addLessonsSchema>;
export type MoveLessonFormValues = z.infer<typeof moveLessonSchema>;