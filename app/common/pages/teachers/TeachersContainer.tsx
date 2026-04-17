"use client"

import React from "react"

import type { Teacher } from "@/app/types/teacher"

import TeachersView, {
  type SubjectOption,
  type TeacherFormValues,
  type TeacherMutationPayload,
} from "./TeachersView"

const subjects: SubjectOption[] = [
  { id: "sub-1", name: "Mathematics" },
  { id: "sub-2", name: "Science" },
  { id: "sub-3", name: "English" },
  { id: "sub-4", name: "History" },
  { id: "sub-5", name: "ICT" },
]

const initialTeachers: Teacher[] = [
  {
    id: "tch-1",
    name: "Kasun Jayasuriya",
    mobile: "+94771230001",
    subjectId: "sub-1",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-2",
    name: "Nadeesha Perera",
    mobile: "+94771230002",
    subjectId: "sub-2",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-3",
    name: "Dineth Fernando",
    mobile: "+94771230003",
    subjectId: "sub-3",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-4",
    name: "Iresha Silva",
    mobile: "+94771230004",
    subjectId: "sub-4",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-5",
    name: "Ravindu Wickramasinghe",
    mobile: "+94771230005",
    subjectId: "sub-5",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-6",
    name: "Upeksha Abeykoon",
    mobile: "+94771230006",
    subjectId: "sub-1",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-7",
    name: "Shanika Madushan",
    mobile: "+94771230007",
    subjectId: "sub-2",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-8",
    name: "Gihani Senanayake",
    mobile: "+94771230008",
    subjectId: "sub-3",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-9",
    name: "Chamod Rajapaksha",
    mobile: "+94771230009",
    subjectId: "sub-4",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-10",
    name: "Tharushi De Zoysa",
    mobile: "+94771230010",
    subjectId: "sub-5",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-11",
    name: "Mihiran Ranasinghe",
    mobile: "+94771230011",
    subjectId: "sub-1",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const parseFormToTeacher = (
  payload: TeacherFormValues
): Omit<Teacher, "id" | "createdAt" | "updatedAt"> => ({
  name: payload.name,
  mobile: payload.mobile,
  subjectId: payload.subjectId,
  isActive: payload.isActive === "true",
})

const TeachersContainer = () => {
  const [teachers, setTeachers] = React.useState<Teacher[]>(initialTeachers)

  const handleSubmitTeacher = (payload: TeacherMutationPayload) => {
    if (payload.mode === "create") {
      const parsedTeacher = parseFormToTeacher(payload.data)

      setTeachers((previous) => [
        ...previous,
        {
          id: `tch-${crypto.randomUUID()}`,
          ...parsedTeacher,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      return
    }

    setTeachers((previous) =>
      previous.map((teacher) => {
        if (teacher.id !== payload.id) {
          return teacher
        }

        return {
          ...teacher,
          ...parseFormToTeacher(payload.data),
          updatedAt: new Date(),
        }
      })
    )
  }

  return (
    <div>
      <TeachersView
        teachers={teachers}
        subjects={subjects}
        onSubmitTeacher={handleSubmitTeacher}
      />
    </div>
  )
}

export default TeachersContainer
