"use client"

import React from "react"

import type { Student } from "@/app/types/students"
import { getAllSubjects, getInstituteByOwnerId } from "@/lib/api/institute-settings.api"
import {
  createStudent,
  createStudentInstituteEnrollment,
  createStudentSubjects,
  deleteStudentInstituteEnrollment,
  deleteStudentSubjects,
  getAllStudentSubjectsByStudentId,
  getAllStudents,
  getAllStudentInstituteEnrollmentsByInstituteId,
  updateStudent,
} from "@/lib/api/students.api"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

import StudentView, {
  type SubjectOption,
  type StudentMutationPayload,
} from "./StudentView"

export const gradeSelectOptions = [
  "Grade-01",
  "Grade-02",
  "Grade-03",
  "Grade-04",
  "Grade-05",
  "Grade-06",
  "Grade-07",
  "Grade-08",
  "Grade-09",
  "Grade-10",
  "Grade-11",
  "Grade-12",
  "Grade-13",
  "Other",
] as const

const StudentsContainer = () => {
  const [students, setStudents] = React.useState<Student[]>([])
  const [subjects, setSubjects] = React.useState<SubjectOption[]>([])
  const [instituteId, setInstituteId] = React.useState<string | null>(null)
  const [assignedStudentIds, setAssignedStudentIds] = React.useState<string[]>([])
  const [assignmentPendingStudentId, setAssignmentPendingStudentId] = React.useState<
    string | null
  >(null)

  React.useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const [allStudents, allSubjects] = await Promise.all([
          getAllStudents(),
          getAllSubjects(),
        ])
        if (!cancelled) {
          setStudents(allStudents)
          setSubjects(allSubjects.map((subject) => ({ id: subject.id, name: subject.name })))
        }
      } catch (error) {
        console.error("Failed to load students", error)
        if (!cancelled) {
          setStudents([])
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

  const handleOpenStudentSubjects = async (student: Student): Promise<string[]> => {
    const studentSubjects = await getAllStudentSubjectsByStudentId(student.id)
    return studentSubjects
      .filter((studentSubject) => studentSubject.is_active)
      .map((studentSubject) => studentSubject.subject_id)
  }

  const handleSaveStudentSubjects = async (
    student: Student,
    nextSubjectIds: string[],
    previousSubjectIds: string[]
  ) => {
    const nextSet = new Set(nextSubjectIds)
    const previousSet = new Set(previousSubjectIds)

    const toCreate = nextSubjectIds
      .filter((subjectId) => !previousSet.has(subjectId))
      .map((subjectId) => ({
        studentId: student.id,
        subjectId,
      }))

    const toDelete = previousSubjectIds
      .filter((subjectId) => !nextSet.has(subjectId))
      .map((subjectId) => ({
        studentId: student.id,
        subjectId,
      }))

    if (!toCreate.length && !toDelete.length) {
      return
    }

    if (toCreate.length) {
      await createStudentSubjects(toCreate)
    }
    if (toDelete.length) {
      await deleteStudentSubjects(toDelete)
    }

    toast.success("Student subjects updated successfully")
  }

  return (
    <div>
      <StudentView
        students={students}
        subjects={subjects}
        gradeSelectOptions={gradeSelectOptions}
        onSubmitStudent={handleSubmitStudent}
        assignedStudentIds={assignedStudentIds}
        onAssignStudent={handleAssignStudent}
        onUnassignStudent={handleUnassignStudent}
        assignmentPendingStudentId={assignmentPendingStudentId}
        onOpenStudentSubjects={handleOpenStudentSubjects}
        onSaveStudentSubjects={handleSaveStudentSubjects}
      />
    </div>
  )
}

export default StudentsContainer