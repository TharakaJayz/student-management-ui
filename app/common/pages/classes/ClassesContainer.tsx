"use client"

import React from "react"

import type { Class } from "@/app/types/class"
import { Days } from "@/app/types/common"

import ClassesView, { type ClassFormValues, type ClassMutationPayload, type EntityOption } from "./ClassesView"

const instituteId = "ins-demo-1"

const classRoomOptions: EntityOption[] = [
  { id: "room-1", name: "Main Hall" },
  { id: "room-2", name: "Room A-201" },
  { id: "room-3", name: "Room B-105" },
  { id: "room-4", name: "Science Lab" },
  { id: "room-5", name: "Computer Lab" },
]

const teacherOptions: EntityOption[] = [
  { id: "tch-1", name: "Kasun Jayasuriya" },
  { id: "tch-2", name: "Nadeesha Perera" },
  { id: "tch-3", name: "Dineth Fernando" },
  { id: "tch-4", name: "Iresha Silva" },
  { id: "tch-5", name: "Ravindu Wickramasinghe" },
]

const subjectOptions: EntityOption[] = [
  { id: "sub-1", name: "Mathematics" },
  { id: "sub-2", name: "Science" },
  { id: "sub-3", name: "English" },
  { id: "sub-4", name: "History" },
  { id: "sub-5", name: "ICT" },
]

const initialClasses: Class[] = [
  {
    id: "cls-1",
    name: "Grade 8 Mathematics",
    classRoomId: "room-1",
    instituteId,
    teacherId: "tch-1",
    subjectId: "sub-1",
    grade: "Grade 8",
    startTime: 8,
    endTime: 10,
    frequency: "WEEKLY",
    day: Days.MONDAY,
    classFee: 3500,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cls-2",
    name: "Grade 9 Science",
    classRoomId: "room-4",
    instituteId,
    teacherId: "tch-2",
    subjectId: "sub-2",
    grade: "Grade 9",
    startTime: 10,
    endTime: 12,
    frequency: "WEEKLY",
    day: Days.MONDAY,
    classFee: 4000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cls-3",
    name: "Grade 10 English",
    classRoomId: "room-2",
    instituteId,
    teacherId: "tch-3",
    subjectId: "sub-3",
    grade: "Grade 10",
    startTime: 13,
    endTime: 15,
    frequency: "WEEKLY",
    day: Days.TUESDAY,
    classFee: 3200,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cls-4",
    name: "Grade 11 History",
    classRoomId: "room-3",
    instituteId,
    teacherId: "tch-4",
    subjectId: "sub-4",
    grade: "Grade 11",
    startTime: 15,
    endTime: 17,
    frequency: "WEEKLY",
    day: Days.WEDNESDAY,
    classFee: 3000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cls-5",
    name: "Grade 9 ICT",
    classRoomId: "room-5",
    instituteId,
    teacherId: "tch-5",
    subjectId: "sub-5",
    grade: "Grade 9",
    startTime: 9,
    endTime: 11,
    frequency: "OTHER",
    day: Days.THURSDAY,
    classFee: 4500,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const parseFormToClass = (
  payload: ClassFormValues
): Omit<Class, "id" | "createdAt" | "updatedAt" | "instituteId"> => ({
  name: payload.name,
  classRoomId: payload.classRoomId,
  teacherId: payload.teacherId,
  subjectId: payload.subjectId,
  grade: payload.grade,
  startTime: payload.startTime,
  endTime: payload.endTime,
  frequency: payload.frequency,
  day: payload.day,
  classFee: payload.classFee,
  isActive: payload.isActive === "true",
})

const ClassesContainer = () => {
  const [classes, setClasses] = React.useState<Class[]>(initialClasses)

  const handleSubmitClass = (payload: ClassMutationPayload) => {
    if (payload.mode === "create") {
      const parsedClass = parseFormToClass(payload.data)
      const now = new Date()

      setClasses((previous) => [
        ...previous,
        {
          id: `cls-${crypto.randomUUID()}`,
          instituteId,
          ...parsedClass,
          createdAt: now,
          updatedAt: now,
        },
      ])
      return
    }

    setClasses((previous) =>
      previous.map((item) => {
        if (item.id !== payload.id) {
          return item
        }

        return {
          ...item,
          ...parseFormToClass(payload.data),
          updatedAt: new Date(),
        }
      })
    )
  }

  return (
    <div>
      <ClassesView
        classes={classes}
        classRoomOptions={classRoomOptions}
        teacherOptions={teacherOptions}
        subjectOptions={subjectOptions}
        onSubmitClass={handleSubmitClass}
      />
    </div>
  )
}

export default ClassesContainer
