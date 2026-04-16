"use client"

import React from "react"

import type { Student } from "@/app/types/students"

import StudentView, {
  type StudentFormValues,
  type StudentMutationPayload,
} from "./StudentView"

const initialStudents: Student[] = [
  {
    id: "std-1",
    name: "Amara Silva",
    age: 10,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    grade: "Grade 5",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "std-2",
    name: "Kavindu Perera",
    age: 12,
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    grade: "Grade 7",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "std-3",
    name: "Nethmi Fernando",
    age: 15,
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    grade: "Grade 10",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "std-4",
    name: "Rivinu Wickramasinghe",
    age: 14,
    imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    grade: "Grade 9",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "std-5",
    name: "Dulani Jayawardena",
    age: 11,
    imageUrl: "https://images.unsplash.com/photo-1541534401786-2077eed87a72",
    grade: "Grade 6",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "std-6",
    name: "Sahan Weerasinghe",
    age: 13,
    imageUrl: "https://images.unsplash.com/photo-1521119989659-a83eee488004",
    grade: "Grade 8",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "std-7",
    name: "Yenuli Rathnayake",
    age: 9,
    imageUrl: "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845",
    grade: "Grade 4",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "std-8",
    name: "Nipun Karunaratne",
    age: 16,
    imageUrl: "https://images.unsplash.com/photo-1504593811423-6dd665756598",
    grade: "Grade 11",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "std-9",
    name: "Piumi De Silva",
    age: 14,
    imageUrl: "https://images.unsplash.com/photo-1546961329-78bef0414d7c",
    grade: "Grade 9",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "std-10",
    name: "Thivinu Abeysekera",
    age: 12,
    imageUrl: "https://images.unsplash.com/photo-1552058544-f2b08422138a",
    grade: "Grade 7",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "std-11",
    name: "Amani Senanayake",
    age: 17,
    imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91",
    grade: "Grade 12",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "std-12",
    name: "Vihanga Rajapaksha",
    age: 8,
    imageUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef",
    grade: "Grade 3",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const parseFormToStudent = (
  payload: StudentFormValues
): Omit<Student, "id" | "createdAt" | "updatedAt"> => ({
  name: payload.name,
  age: payload.age,
  imageUrl: payload.imageUrl,
  grade: payload.grade,
  isActive: payload.isActive === "true",
})

const StudentsContainer = () => {
  const [students, setStudents] = React.useState<Student[]>(initialStudents)

  const handleSubmitStudent = (payload: StudentMutationPayload) => {
    if (payload.mode === "create") {
      const parsedStudent = parseFormToStudent(payload.data)

      setStudents((previous) => [
        ...previous,
        {
          id: `std-${crypto.randomUUID()}`,
          ...parsedStudent,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      return
    }

    setStudents((previous) =>
      previous.map((student) => {
        if (student.id !== payload.id) {
          return student
        }

        return {
          ...student,
          ...parseFormToStudent(payload.data),
          updatedAt: new Date(),
        }
      })
    )
  }

  return (
    <div>
      <StudentView students={students} onSubmitStudent={handleSubmitStudent} />
    </div>
  )
}

export default StudentsContainer