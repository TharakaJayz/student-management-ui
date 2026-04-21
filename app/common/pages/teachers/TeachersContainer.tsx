"use client"

import React from "react"

import type { Teacher } from "@/app/types/teacher"
import {
  getAllSubjects,
  getInstituteByOwnerId,
} from "@/lib/api/institute-settings.api"
import {
  createTeacher,
  getAllTeachers,
  updateTeacher,
} from "@/lib/api/teachers.api"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

import TeachersView, {
  type SubjectOption,
  type TeacherMutationPayload,
} from "./TeachersView"

const TeachersContainer = () => {
  const [teachers, setTeachers] = React.useState<Teacher[]>([])
  const [subjects, setSubjects] = React.useState<SubjectOption[]>([])
  const [instituteId, setInstituteId] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const allSubjects = await getAllSubjects()
        if (cancelled) return

        setSubjects(allSubjects.map((subject) => ({ id: subject.id, name: subject.name })))
      } catch (error) {
        console.error("Failed to load subjects for teachers form", error)
        if (!cancelled) {
          setSubjects([])
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const {
          data: { user },
        } = await getSupabaseBrowserClient().auth.getUser()
        if (!user || cancelled) return

        const institute = await getInstituteByOwnerId(user.id)
        if (cancelled) return
        if (!institute) {
          setInstituteId(null)
          setTeachers([])
          return
        }

        setInstituteId(institute.id)
        const allTeachers = await getAllTeachers(institute.id)
        if (!cancelled) {
          setTeachers(allTeachers)
        }
      } catch (error) {
        console.error("Failed to load teachers", error)
        if (!cancelled) {
          setTeachers([])
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmitTeacher = async (payload: TeacherMutationPayload) => {
    if (!instituteId) {
      console.warn("Cannot create/update teacher without institute id")
      return
    }

    if (payload.mode === "create") {
      const createdTeacher = await createTeacher({
        name: payload.data.name,
        mobile: payload.data.mobile,
        subjectId: payload.data.subject_id,
      })
      setTeachers((previous) => [...previous, createdTeacher])
      return
    }

    const updatedTeacher = await updateTeacher({
      teacherId: payload.id,
      name: payload.data.name,
      mobile: payload.data.mobile,
      subjectId: payload.data.subject_id,
    })
    setTeachers((previous) =>
      previous.map((teacher) => (teacher.id === payload.id ? updatedTeacher : teacher))
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
