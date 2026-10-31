import { z } from "zod";
import type { DefaultValues } from "react-hook-form";
import { amount, requiredText, wholeNumber } from "../../lib/validation";
import { toServerLocal } from "../../lib/format";
import { checkLessonTimes, lessonTimesField } from "../lessons/schema";
import { recurringDates, secondDayError } from "../../lib/recurringDates";
import type {
  CreateGroupRequest,
  GroupDetailsDto,
  Season,
  UpdateGroupRequest,
} from "../../types/typesDtos";

const LOCAL_TIME = "YYYY-MM-DDTHH:mm";
const MAX_LESSONS = 200;

export const groupFormSchema = z
  .object({
    name: requiredText(100),
    year: wholeNumber(2020, 2100),
    season: z.enum(["Winter", "Spring", "Summer", "Autumn"], { error: "יש לבחור עונה" }),
    price: amount,
    maxStudents: wholeNumber(1, 500),
    isActive: z.boolean(),
    lessonMode: z.enum(["weekly", "twiceWeekly", "manual", "keep"]),
    firstLessonAt: z.string(),
    secondLessonAt: z.string(),
    weeklyCount: z.string(),
    lessonTimes: lessonTimesField,
  })
  .superRefine((data, ctx) => {
    if (data.lessonMode === "weekly" || data.lessonMode === "twiceWeekly") {
      if (!data.firstLessonAt) {
        ctx.addIssue({
          code: "custom",
          path: ["firstLessonAt"],
          message: "יש לבחור תאריך ושעה לשיעור הראשון",
        });
      }
 
      const count = Number(data.weeklyCount);
      if (!Number.isInteger(count) || count < 1 || count > MAX_LESSONS) {
        ctx.addIssue({
          code: "custom",
          path: ["weeklyCount"],
          message: `יש להזין מספר שיעורים שלם בין 1 ל-${MAX_LESSONS}`,
        });
      }
    }

    if (data.lessonMode === "twiceWeekly") {
      const error = data.secondLessonAt
        ? secondDayError(data.firstLessonAt, data.secondLessonAt)
        : "יש לבחור תאריך ושעה לשיעור הראשון ביום השני";
      if (error) {
        ctx.addIssue({ code: "custom", path: ["secondLessonAt"], message: error });
      }
    }
 
    if (data.lessonMode === "manual") {
      checkLessonTimes(data.lessonTimes, ctx);
    }
  });
 
export type GroupFormValues = z.infer<typeof groupFormSchema>;
export function currentSeason(): Season {
  const month = new Date().getMonth() + 1;
  if (month === 12 || month <= 2) return "Winter";
  if (month <= 5) return "Spring";
  if (month <= 8) return "Summer";
  return "Autumn";
}
export function getGroupDefaults(group?: GroupDetailsDto): DefaultValues<GroupFormValues> {
  if (!group) {
    return {
      name: "",
      year: new Date().getFullYear(),
      season: currentSeason(),
      isActive: true,
      lessonMode: "weekly",
      firstLessonAt: "",
      secondLessonAt: "",
      weeklyCount: "",
      lessonTimes: [{ value: "" }],
    };
  }
 
  return {
    name: group.name,
    year: group.year,
    season: group.season,
    price: group.price,
    maxStudents: group.maxStudents,
    isActive: group.isActive,
    lessonMode: "keep",
    firstLessonAt: "",
    secondLessonAt: "",
    weeklyCount: "",
    lessonTimes: [],
  };
}
export function toCreateGroupRequest(values: GroupFormValues): CreateGroupRequest {
  const group = {
    name: values.name,
    year: values.year,
    season: values.season,
    price: values.price,
    maxStudents: values.maxStudents,
  };
 
  if (values.lessonMode === "weekly") {
    return {
      ...group,
      firstLessonAt: toServerLocal(values.firstLessonAt),
      lessonsCount: Number(values.weeklyCount),
    };
  }

  // פעמיים בשבוע: נשלח לשרת כרשימת מועדים, כמו רשימה ידנית
  if (values.lessonMode === "twiceWeekly") {
    const times = autoLessonTimes(
      "twiceWeekly",
      values.firstLessonAt,
      values.secondLessonAt,
      Number(values.weeklyCount),
    );
    return { ...group, lessonTimes: times.map(toServerLocal) };
  }
 
  return {
    ...group,
    lessonTimes: values.lessonTimes.map((time) => toServerLocal(time.value)),
  };
}
 

export function toUpdateGroupRequest(
  values: GroupFormValues,
  group: GroupDetailsDto,
): UpdateGroupRequest {
  return {
    name: values.name,
    price: values.price,
    maxStudents: values.maxStudents,
    isActive: values.isActive,
    lessonsCount: group.lessonsCount,
    version: group.version,
  };
}
 
// המועדים שנוצרים אוטומטית (פעם או פעמיים בשבוע): לתצוגה המקדימה ולשליחה
export function autoLessonTimes(
  mode: GroupFormValues["lessonMode"],
  first: string,
  second: string,
  count: number,
): string[] {
  if (count > MAX_LESSONS) return [];
  if (mode === "weekly") return recurringDates([first], count, LOCAL_TIME);
  if (mode === "twiceWeekly" && !secondDayError(first, second)) {
    return recurringDates([first, second], count, LOCAL_TIME);
  }
  return [];
}
export const GROUP_FILTER_DEFAULTS = {
  name: "",
  season: "",
  year: String(new Date().getFullYear()),
  status: "active",
};
export type GroupFilterValues = typeof GROUP_FILTER_DEFAULTS;