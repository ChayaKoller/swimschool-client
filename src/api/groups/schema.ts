import { z } from "zod";
import dayjs from "dayjs";
import type { DefaultValues } from "react-hook-form";
import { amount, requiredText, wholeNumber } from "../../lib/validation";
import { toServerLocal } from "../../lib/format";
import { checkLessonTimes, lessonTimesField } from "../lessons/schema";
import type {
  CreateGroupRequest,
  GroupDetailsDto,
  Season,
  UpdateGroupRequest,
} from "../../types/typesDtos";

export const groupFormSchema = z
  .object({
    name: requiredText(100),
    year: wholeNumber(2020, 2100),
    season: z.enum(["Winter", "Spring", "Summer", "Autumn"], { error: "יש לבחור עונה" }),
    price: amount,
    maxStudents: wholeNumber(1, 500),
    isActive: z.boolean(),
    lessonMode: z.enum(["weekly", "manual", "keep"]),
    firstLessonAt: z.string(),
    weeklyCount: z.string(),
    lessonTimes: lessonTimesField,
  })
  .superRefine((data, ctx) => {
    if (data.lessonMode === "weekly") {
      if (!data.firstLessonAt) {
        ctx.addIssue({
          code: "custom",
          path: ["firstLessonAt"],
          message: "יש לבחור תאריך ושעה לשיעור הראשון",
        });
      }
 
      const count = Number(data.weeklyCount);
      if (!Number.isInteger(count) || count < 1 || count > 200) {
        ctx.addIssue({
          code: "custom",
          path: ["weeklyCount"],
          message: "יש להזין מספר שיעורים שלם בין 1 ל-200",
        });
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
 
// לתצוגה המקדימה: כל המועדים של "כל שבוע", בשעון ישראל כמו בשדה
export function weeklyTimes(first: string, count: number): string[] {
  if (!first || !Number.isInteger(count) || count < 1 || count > 200) return [];
  return Array.from({ length: count }, (_, i) =>
    dayjs(first).add(i, "week").format("YYYY-MM-DDTHH:mm"),
  );
}
export const GROUP_FILTER_DEFAULTS = {
  name: "",
  season: "",
  year: String(new Date().getFullYear()),
  status: "active",
};
export type GroupFilterValues = typeof GROUP_FILTER_DEFAULTS;