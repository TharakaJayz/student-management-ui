import type { Student } from "@/app/types/students"
import { getSupabaseBrowserClient } from "../supabase/client"
import type { DbRow } from "./db-row"

function mapStudentRow(row: DbRow<Student>): Student {
  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }
}

function normalizeStudentRelation(raw: unknown): DbRow<Student> {
  const s = (Array.isArray(raw) ? raw[0] : raw) as DbRow<Student> | undefined
  if (!s) {
    throw new Error("Enrollment row missing student")
  }
  return s
}

export async function getAllStudents(instituteId: string): Promise<Student[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("student_institute_enrollments")
    .select(
      `
      student:students (
        id,
        name,
        age,
        image_url,
        grade,
        is_active,
        created_at,
        updated_at
      )
    `
    )
    .eq("institute_id", instituteId)
    .eq("is_active", true)

  console.log("student all data", data)
  if (error) throw error
  if (!data?.length) return []

  return data.map((row) => {
    const s = normalizeStudentRelation((row as { student: unknown }).student)
    return mapStudentRow(s)
  })
}
