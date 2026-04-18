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
    subject_id: "sub-1",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "tch-2",
    name: "Nadeesha Perera",
    mobile: "+94771230002",
    subject_id: "sub-2",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "tch-3",
    name: "Dineth Fernando",
    mobile: "+94771230003",
    subject_id: "sub-3",
    is_active: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "tch-4",
    name: "Iresha Silva",
    mobile: "+94771230004",
    subject_id: "sub-4",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "tch-5",
    name: "Ravindu Wickramasinghe",
    mobile: "+94771230005",
    subject_id: "sub-5",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "tch-6",
    name: "Upeksha Abeykoon",
    mobile: "+94771230006",
    subject_id: "sub-1",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "tch-7",
    name: "Shanika Madushan",
    mobile: "+94771230007",
    subject_id: "sub-2",
    is_active: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "tch-8",
    name: "Gihani Senanayake",
    mobile: "+94771230008",
    subject_id: "sub-3",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "tch-9",
    name: "Chamod Rajapaksha",
    mobile: "+94771230009",
    subject_id: "sub-4",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "tch-10",
    name: "Tharushi De Zoysa",
    mobile: "+94771230010",
    subject_id: "sub-5",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "tch-11",
    name: "Mihiran Ranasinghe",
    mobile: "+94771230011",
    subject_id: "sub-1",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
]

const parseFormToTeacher = (
  payload: TeacherFormValues
): Omit<Teacher, "id" | "created_at" | "updated_at"> => ({
  name: payload.name,
  mobile: payload.mobile,
  subject_id: payload.subject_id,
  is_active: payload.is_active === "true",
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
          created_at: new Date(),
          updated_at: new Date(),
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
          updated_at: new Date(),
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
