"use client"

import React from "react"

import type { Student } from "@/app/types/students"
import { getInstituteByOwnerId } from "@/lib/api/institute-settings.api"
import { createStudent, getAllStudents, updateStudent } from "@/lib/api/students.api"
import {
  createStudentInstituteEnrollment,
  deleteStudentInstituteEnrollment,
  getAllStudentInstituteEnrollmentsByInstituteId,
} from "@/lib/api/students.api"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

import StudentView, {
  type StudentMutationPayload,
} from "./StudentView"

const StudentsContainer = () => {
  const [students, setStudents] = React.useState<Student[]>([])
  const [instituteId, setInstituteId] = React.useState<string | null>(null)
  const [assignedStudentIds, setAssignedStudentIds] = React.useState<string[]>([])
  const [assignmentPendingStudentId, setAssignmentPendingStudentId] = React.useState<
    string | null
  >(null)

  React.useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const allStudents = await getAllStudents()
        if (!cancelled) {
          setStudents(allStudents)
        }
      } catch (error) {
        console.error("Failed to load students", error)
        if (!cancelled) {
          setStudents([])
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
          setAssignedStudentIds([])
          return
        }

        setInstituteId(institute.id)
        const enrollments = await getAllStudentInstituteEnrollmentsByInstituteId(institute.id)
        if (!cancelled) {
          setAssignedStudentIds(
            enrollments.filter((enrollment) => enrollment.is_active).map((row) => row.student_id)
          )
        }
      } catch (error) {
        console.error("Failed to load student assignments", error)
        if (!cancelled) {
          setAssignedStudentIds([])
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmitStudent = async (payload: StudentMutationPayload) => {
    if (payload.mode === "create") {
      const createdStudent = await createStudent({
        name: payload.data.name,
        age: payload.data.age,
        grade: payload.data.grade,
        imageUrl: payload.data.image_url || undefined,
      })
      setStudents((previous) => [...previous, createdStudent])
      toast.success("Student created successfully")
      return
    }

    const updatedStudent = await updateStudent({
      studentId: payload.id,
      name: payload.data.name,
      age: payload.data.age,
      grade: payload.data.grade,
      imageUrl: payload.data.image_url || undefined,
    })
    setStudents((previous) =>
      previous.map((student) => (student.id === payload.id ? updatedStudent : student))
    )
    toast.success("Student updated successfully")
  }

  const handleAssignStudent = async (student: Student) => {
    if (!instituteId) {
      toast.error("Institute is required to assign students")
      return
    }

    setAssignmentPendingStudentId(student.id)
    try {
      await createStudentInstituteEnrollment({
        studentId: student.id,
        instituteId,
      })
      setAssignedStudentIds((previous) =>
        previous.includes(student.id) ? previous : [...previous, student.id]
      )
      toast.success(`${student.name} assigned to institute`)
    } catch (error) {
      console.error("Failed to assign student", error)
      toast.error("Could not assign student")
      throw error
    } finally {
      setAssignmentPendingStudentId(null)
    }
  }

  const handleUnassignStudent = async (student: Student) => {
    if (!instituteId) {
      toast.error("Institute is required to unassign students")
      return
    }

    setAssignmentPendingStudentId(student.id)
    try {
      await deleteStudentInstituteEnrollment({
        studentId: student.id,
        instituteId,
      })
      setAssignedStudentIds((previous) => previous.filter((id) => id !== student.id))
      toast.success(`${student.name} unassigned from institute`)
    } catch (error) {
      console.error("Failed to unassign student", error)
      toast.error("Could not unassign student")
      throw error
    } finally {
      setAssignmentPendingStudentId(null)
    }
  }

  return (
    <div>
      <StudentView
        students={students}
        onSubmitStudent={handleSubmitStudent}
        assignedStudentIds={assignedStudentIds}
        onAssignStudent={handleAssignStudent}
        onUnassignStudent={handleUnassignStudent}
        assignmentPendingStudentId={assignmentPendingStudentId}
      />
    </div>
  )
}

export default StudentsContainer