"use client"

import React from "react"

import type { Teacher } from "@/app/types/teacher"

import TeachersView, {
  type TeacherFormValues,
  type TeacherMutationPayload,
} from "./TeachersView"

const initialTeachers: Teacher[] = [
  {
    id: "tch-1",
    name: "Kasun Jayasuriya",
    mobile: "+94771230001",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-2",
    name: "Nadeesha Perera",
    mobile: "+94771230002",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-3",
    name: "Dineth Fernando",
    mobile: "+94771230003",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-4",
    name: "Iresha Silva",
    mobile: "+94771230004",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-5",
    name: "Ravindu Wickramasinghe",
    mobile: "+94771230005",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-6",
    name: "Upeksha Abeykoon",
    mobile: "+94771230006",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-7",
    name: "Shanika Madushan",
    mobile: "+94771230007",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-8",
    name: "Gihani Senanayake",
    mobile: "+94771230008",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-9",
    name: "Chamod Rajapaksha",
    mobile: "+94771230009",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-10",
    name: "Tharushi De Zoysa",
    mobile: "+94771230010",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tch-11",
    name: "Mihiran Ranasinghe",
    mobile: "+94771230011",
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
      <TeachersView teachers={teachers} onSubmitTeacher={handleSubmitTeacher} />
    </div>
  )
}

export default TeachersContainer
