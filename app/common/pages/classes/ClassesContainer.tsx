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
    class_room_id: "room-1",
    institute_id: instituteId,
    teacher_id: "tch-1",
    subject_id: "sub-1",
    grade: "Grade 8",
    start_time: 8,
    end_time: 10,
    frequency: "WEEKLY",
    day: Days.MONDAY,
    class_fee: 3500,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "cls-2",
    name: "Grade 9 Science",
    class_room_id: "room-4",
    institute_id: instituteId,
    teacher_id: "tch-2",
    subject_id: "sub-2",
    grade: "Grade 9",
    start_time: 10,
    end_time: 12,
    frequency: "WEEKLY",
    day: Days.MONDAY,
    class_fee: 4000,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "cls-3",
    name: "Grade 10 English",
    class_room_id: "room-2",
    institute_id: instituteId,
    teacher_id: "tch-3",
    subject_id: "sub-3",
    grade: "Grade 10",
    start_time: 13,
    end_time: 15,
    frequency: "WEEKLY",
    day: Days.TUESDAY,
    class_fee: 3200,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "cls-4",
    name: "Grade 11 History",
    class_room_id: "room-3",
    institute_id: instituteId,
    teacher_id: "tch-4",
    subject_id: "sub-4",
    grade: "Grade 11",
    start_time: 15,
    end_time: 17,
    frequency: "WEEKLY",
    day: Days.WEDNESDAY,
    class_fee: 3000,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "cls-5",
    name: "Grade 9 ICT",
    class_room_id: "room-5",
    institute_id: instituteId,
    teacher_id: "tch-5",
    subject_id: "sub-5",
    grade: "Grade 9",
    start_time: 9,
    end_time: 11,
    frequency: "OTHER",
    day: Days.THURSDAY,
    class_fee: 4500,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
]

const parseFormToClass = (
  payload: ClassFormValues
): Omit<Class, "id" | "created_at" | "updated_at" | "institute_id"> => ({
  name: payload.name,
  class_room_id: payload.class_room_id,
  teacher_id: payload.teacher_id,
  subject_id: payload.subject_id,
  grade: payload.grade,
  start_time: payload.start_time,
  end_time: payload.end_time,
  frequency: payload.frequency,
  day: payload.day,
  class_fee: payload.class_fee,
  is_active: payload.is_active === "true",
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
          institute_id: instituteId,
          ...parsedClass,
          created_at: now,
          updated_at: now,
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
          updated_at: new Date(),
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
