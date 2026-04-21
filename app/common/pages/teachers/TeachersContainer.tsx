"use client"

import React from "react"

import type { Teacher } from "@/app/types/teacher"
import {
  getAllSubjects,
  getInstituteByOwnerId,
} from "@/lib/api/institute-settings.api"
import {
  createTeacherInstituteAssignment,
  deleteTeacherInstituteAssignment,
  getAllTeacherInstituteAssignmentsByInstituteId,
  createTeacher,
  getAllTeachers,
  updateTeacher,
} from "@/lib/api/teachers.api"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

import TeachersView, {
  type SubjectOption,
  type TeacherMutationPayload,
} from "./TeachersView"

const TeachersContainer = () => {
  const [teachers, setTeachers] = React.useState<Teacher[]>([])
  const [subjects, setSubjects] = React.useState<SubjectOption[]>([])
  const [instituteId, setInstituteId] = React.useState<string | null>(null)
  const [assignedTeacherIds, setAssignedTeacherIds] = React.useState<string[]>([])
  const [assignmentPendingTeacherId, setAssignmentPendingTeacherId] = React.useState<
    string | null
  >(null)

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
        const [allTeachers, assignments] = await Promise.all([
          getAllTeachers(),
          getAllTeacherInstituteAssignmentsByInstituteId(institute.id),
        ])
        if (!cancelled) {
          setTeachers(allTeachers)
          setAssignedTeacherIds(
            assignments.filter((assignment) => assignment.is_active).map((row) => row.teacher_id)
          )
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
      toast.success("Teacher created successfully")
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
    toast.success("Teacher updated successfully")
  }

  const handleAssignTeacher = async (teacher: Teacher) => {
    if (!instituteId) {
      toast.error("Institute is required to assign teachers")
      return
    }

    setAssignmentPendingTeacherId(teacher.id)
    try {
      await createTeacherInstituteAssignment({
        teacherId: teacher.id,
        instituteId,
      })
      setAssignedTeacherIds((previous) =>
        previous.includes(teacher.id) ? previous : [...previous, teacher.id]
      )
      toast.success(`${teacher.name} assigned to institute`)
    } catch (error) {
      console.error("Failed to assign teacher", error)
      toast.error("Could not assign teacher")
      throw error
    } finally {
      setAssignmentPendingTeacherId(null)
    }
  }

  const handleUnassignTeacher = async (teacher: Teacher) => {
    if (!instituteId) {
      toast.error("Institute is required to unassign teachers")
      return
    }

    setAssignmentPendingTeacherId(teacher.id)
    try {
      await deleteTeacherInstituteAssignment({
        teacherId: teacher.id,
        instituteId,
      })
      setAssignedTeacherIds((previous) => previous.filter((id) => id !== teacher.id))
      toast.success(`${teacher.name} unassigned from institute`)
    } catch (error) {
      console.error("Failed to unassign teacher", error)
      toast.error("Could not unassign teacher")
      throw error
    } finally {
      setAssignmentPendingTeacherId(null)
    }
  }

  return (
    <div>
      <TeachersView
        teachers={teachers}
        subjects={subjects}
        onSubmitTeacher={handleSubmitTeacher}
        assignedTeacherIds={assignedTeacherIds}
        onAssignTeacher={handleAssignTeacher}
        onUnassignTeacher={handleUnassignTeacher}
        assignmentPendingTeacherId={assignmentPendingTeacherId}
      />
    </div>
  )
}

export default TeachersContainer
