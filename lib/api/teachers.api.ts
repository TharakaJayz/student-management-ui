// app/lib/api/teachers.ts (example path)
import { Teacher, Teacher_institute_assignments } from "@/app/types/teacher"
import { getSupabaseBrowserClient } from "../supabase/client"
import type { DbRow } from "./db-row"

export type CreateTeacherPayload = {
  name: string
  mobile: string
  subjectId: string
}

export type UpdateTeacherPayload = {
  teacherId: string
  name: string
  mobile: string
  subjectId: string
}

function mapTeacherRow(row: DbRow<Teacher>): Teacher {
  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }
}

function normalizeTeacherRelation(raw: unknown): DbRow<Teacher> {
  const t = (Array.isArray(raw) ? raw[0] : raw) as DbRow<Teacher> | undefined
  if (!t) {
    throw new Error("Assignment row missing teacher")
  }
  return t
}

/**
 * 4) Get all teachers by institute_id (via teacher_institute_assignments)
 */
export async function getAllTeachers(instituteId: string): Promise<Teacher[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("teacher_institute_assignments")
    .select(
      `
      teacher:teachers (
        id,
        name,
        mobile,
        subject_id,
        is_active,
        created_at,
        updated_at
      )
    `
    )
    .eq("institute_id", instituteId)
    .eq("is_active", true)

  if (error) throw error
  if (!data?.length) return []

  return data.map((row) => {
    const t = normalizeTeacherRelation((row as { teacher: unknown }).teacher)
    return mapTeacherRow(t)
  })
}

export async function getAllTeachersByInstituteId(instituteId: string): Promise<Teacher[]> {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("teacher_institute_assignments")
      .select(
        `
        teacher:teachers (
          id,
          name,
          mobile,
          subject_id,
          is_active,
          created_at,
          updated_at
        )
      `
      )
      .eq("institute_id", instituteId)
      .eq("is_active", true) // assignment active
    if (error) throw error
    if (!data?.length) return []
    return data
      .map((row) => normalizeTeacherRelation((row as { teacher: unknown }).teacher))
      .filter((teacher) => teacher.is_active) // teacher active
      .map(mapTeacherRow)
  }

/**
 * 2) Create teacher via edge function create-teacher
 * Expects body: { name, mobile, subjectId }
 * Returns: { teacher }
 */
export async function createTeacher(payload: CreateTeacherPayload): Promise<Teacher> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke("create-teacher", {
    body: payload,
  })

  if (error) throw error
  if (!data?.teacher) throw new Error("create-teacher returned no teacher")

  return mapTeacherRow(data.teacher as DbRow<Teacher>)
}

/**
 * 3) Update teacher via edge function update-teacher
 * Expects body: { teacherId, name, mobile, subjectId }
 * Returns: { teacher }
 */
export async function updateTeacher(payload: UpdateTeacherPayload): Promise<Teacher> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke("update-teacher", {
    body: payload,
  })

  if (error) throw error
  if (!data?.teacher) throw new Error("update-teacher returned no teacher")

  return mapTeacherRow(data.teacher as DbRow<Teacher>)
}


type CreateTeacherInstituteAssignmentPayload = {
    teacherId: string
    instituteId: string
    isActive?: boolean // optional, backend defaults true
  }
  type UpdateTeacherInstituteAssignmentPayload = {
    teacherId: string
    instituteId: string
    isActive: boolean
  }
  function mapTeacherInstituteAssignmentRow(
    row: DbRow<Teacher_institute_assignments>,
  ): Teacher_institute_assignments {
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    }
  }
  /**
   * Create assignment via edge function create-teacher-institute-assignment
   * Expects body: { teacherId, instituteId, isActive? }
   * Returns: { teacherInstituteAssignment }
   */
  export async function createTeacherInstituteAssignment(
    payload: CreateTeacherInstituteAssignmentPayload,
  ): Promise<Teacher_institute_assignments> {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.functions.invoke("create-teacher-institute-assignment", {
      body: payload,
    })
    if (error) throw error
    if (!data?.teacherInstituteAssignment) {
      throw new Error("create-teacher-institute-assignment returned no teacherInstituteAssignment")
    }
    return mapTeacherInstituteAssignmentRow(
      data.teacherInstituteAssignment as DbRow<Teacher_institute_assignments>,
    )
  }
  /**
   * Update assignment via edge function update-teacher-institute-assignment
   * Expects body: { teacherId, instituteId, isActive }
   * Returns: { teacherInstituteAssignment }
   */
  export async function updateTeacherInstituteAssignment(
    payload: UpdateTeacherInstituteAssignmentPayload,
  ): Promise<Teacher_institute_assignments> {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.functions.invoke("update-teacher-institute-assignment", {
      body: payload,
    })
    if (error) throw error
    if (!data?.teacherInstituteAssignment) {
      throw new Error("update-teacher-institute-assignment returned no teacherInstituteAssignment")
    }
    return mapTeacherInstituteAssignmentRow(
      data.teacherInstituteAssignment as DbRow<Teacher_institute_assignments>,
    )
  }

