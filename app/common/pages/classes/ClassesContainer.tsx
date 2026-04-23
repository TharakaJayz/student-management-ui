"use client"

import React from "react"

import type { Class } from "@/app/types/class"
import {
  createClass,
  getAllClassesByInstituteId,
  getAllStudentClassesByClassIds,
  updateClass,
} from "@/lib/api/class.api"
import { getAllSubjects, getClassRoomsByInstituteId, getInstituteByOwnerId } from "@/lib/api/institute-settings.api"
import { getAllTeachersByInstituteId } from "@/lib/api/teachers.api"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { gradeSelectOptions } from "@/app/common/pages/students/StudentsContainer"

import ClassesView, { type ClassFormValues, type ClassMutationPayload, type EntityOption } from "./ClassesView"

const parseFormToClass = (
  payload: ClassFormValues
): {
  name: string
  classRoomId: string
  teacherId: string
  subjectId: string
  grade: string
  startTime: number
  endTime: number
  frequency: "WEEKLY" | "OTHER"
  day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY"
  classFee: number
} => ({
  name: payload.name,
  classRoomId: payload.class_room_id,
  teacherId: payload.teacher_id,
  subjectId: payload.subject_id,
  grade: payload.grade,
  startTime: payload.start_time,
  endTime: payload.end_time,
  frequency: payload.frequency,
  day: payload.day,
  classFee: payload.class_fee,
})

const ClassesContainer = () => {
  const [classes, setClasses] = React.useState<Class[]>([])
  const [instituteId, setInstituteId] = React.useState<string | null>(null)
  const [classRoomOptions, setClassRoomOptions] = React.useState<EntityOption[]>([])
  const [teacherOptions, setTeacherOptions] = React.useState<EntityOption[]>([])
  const [subjectOptions, setSubjectOptions] = React.useState<EntityOption[]>([])
  const [studentCountByClassId, setStudentCountByClassId] = React.useState<Record<string, number>>({})

  React.useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const {
          data: { user },
        } = await getSupabaseBrowserClient().auth.getUser()
        if (!user || cancelled) return

        const institute = await getInstituteByOwnerId(user.id)
        if (!institute || cancelled) {
          if (!cancelled) {
            setInstituteId(null)
            setClasses([])
            setClassRoomOptions([])
            setTeacherOptions([])
            setSubjectOptions([])
            setStudentCountByClassId({})
          }
          return
        }

        setInstituteId(institute.id)
        const [allClasses, classRooms, teachers, subjects] = await Promise.all([
          getAllClassesByInstituteId(institute.id),
          getClassRoomsByInstituteId(institute.id),
          getAllTeachersByInstituteId(institute.id),
          getAllSubjects(),
        ])

        const studentClasses = await getAllStudentClassesByClassIds(allClasses.map((item) => item.id))
        const nextStudentCountByClassId = studentClasses.reduce<Record<string, number>>((accumulator, item) => {
          accumulator[item.class_id] = (accumulator[item.class_id] ?? 0) + 1
          return accumulator
        }, {})

        if (!cancelled) {
          setClasses(allClasses)
          setClassRoomOptions(classRooms.map((room) => ({ id: room.id, name: room.name })))
          setTeacherOptions(teachers.map((teacher) => ({ id: teacher.id, name: teacher.name })))
          setSubjectOptions(subjects.map((subject) => ({ id: subject.id, name: subject.name })))
          setStudentCountByClassId(nextStudentCountByClassId)
        }
      } catch (error) {
        console.error("Failed to load class form options", error)
        if (!cancelled) {
          setInstituteId(null)
          setClasses([])
          setClassRoomOptions([])
          setTeacherOptions([])
          setSubjectOptions([])
          setStudentCountByClassId({})
          toast.error("Could not load classes and class form options")
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmitClass = async (payload: ClassMutationPayload) => {
    if (!instituteId) {
      toast.error("Institute is required to manage classes")
      return
    }

    if (payload.mode === "create") {
      try {
        const createdClass = await createClass({
          ...parseFormToClass(payload.data),
          instituteId,
        })
        setClasses((previous) => [...previous, createdClass])
        setStudentCountByClassId((previous) => ({ ...previous, [createdClass.id]: 0 }))
        toast.success("Class created successfully")
      } catch (error) {
        console.error("Failed to create class", error)
        toast.error("Could not create class")
        throw error
      }
      return
    }

    try {
      const updatedClass = await updateClass({
        classId: payload.id,
        ...parseFormToClass(payload.data),
      })
      setClasses((previous) =>
        previous.map((item) => (item.id === payload.id ? updatedClass : item))
      )
      setStudentCountByClassId((previous) => ({
        ...previous,
        [updatedClass.id]: previous[updatedClass.id] ?? 0,
      }))
      toast.success("Class updated successfully")
    } catch (error) {
      console.error("Failed to update class", error)
      toast.error("Could not update class")
      throw error
    }
  }

  return (
    <div>
      <ClassesView
        classes={classes}
        classRoomOptions={classRoomOptions}
        teacherOptions={teacherOptions}
        subjectOptions={subjectOptions}
        studentCountByClassId={studentCountByClassId}
        gradeOptions={gradeSelectOptions}
        onSubmitClass={handleSubmitClass}
      />
    </div>
  )
}

export default ClassesContainer
