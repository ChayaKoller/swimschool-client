type Filter = Record<string, unknown>;

export const queryKeys = {
  students: {
    all: ["students"] as const,
    list: (filter: Filter) => ["students", filter] as const,
    detail: (id: number) => ["student", id] as const,
    reports: (id: number) => ["student", id, "reports"] as const,
  },
  groups: {
    all: ["groups"] as const,
    list: (filter: Filter) => ["groups", filter] as const,
    details: ["group"] as const,
    detail: (id: number) => ["group", id] as const,
  },
  lessons: {
    week: ["lessons", "week"] as const,
  },
  attendance: {
    byLesson: (lessonId: number) => ["attendance", "lesson", lessonId] as const,
    byGroup: (groupId: number) => ["attendance", "group", groupId] as const,
    all:['attendance'] as const,
    lesson:(lessonId:number)=>['attendance', 'lesson', lessonId]
  },
  reports: {
    all: ["reports"] as const,
    list: (filter: Filter) => ["reports", filter] as const,
    detail: (id: number) => ["report", id] as const,
  },
  reportSettings: ["report-settings"] as const,
  teacherOptions: ["teachers", "options"] as const,
  secretaries: ["secretaries"] as const,
  auth: { me: ["auth", "me"] as const }
};