import type { Student, Student_institute_enrollments, Student_subject } from "@/app/types/students"
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

export async function getAllStudentsByInstituteId(instituteId: string): Promise<Student[]> {
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

export async function getAllStudents(): Promise<Student[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("students")
    .select(`
      id,
      name,
      age,
      image_url,
      grade,
      is_active,
      created_at,
      updated_at
    `)
    .eq("is_active", true)

  if (error) throw error
  if (!data?.length) return []

  return data.map((row) => mapStudentRow(row as DbRow<Student>))
}

export type CreateStudentPayload = {
  name: string
  age: number
  grade: string
  imageUrl?: string
}
export type UpdateStudentPayload = {
  studentId: string
  name: string
  age: number
  grade: string
  imageUrl?: string
}
/**
 * create-student
 * body: { name, age, grade, imageUrl? }
 * returns: { student }
 */
export async function createStudent(payload: CreateStudentPayload): Promise<Student> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke("create-student", {
    body: payload,
  })
  if (error) throw error
  if (!data?.student) throw new Error("create-student returned no student")
  return mapStudentRow(data.student as DbRow<Student>)
}
/**
 * update-student
 * body: { studentId, name, age, grade, imageUrl? }
 * returns: { student }
 */
export async function updateStudent(payload: UpdateStudentPayload): Promise<Student> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke("update-student", {
    body: payload,
  })
  if (error) throw error
  if (!data?.student) throw new Error("update-student returned no student")
  return mapStudentRow(data.student as DbRow<Student>)
}


type CreateStudentInstituteEnrollmentPayload = {
  studentId: string
  instituteId: string
  isActive?: boolean // optional, backend defaults true
}
type DeleteStudentInstituteEnrollmentPayload = {
  studentId: string
  instituteId: string
}
function mapStudentInstituteEnrollmentRow(
  row: DbRow<Student_institute_enrollments>,
): Student_institute_enrollments {
  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }
}
/**
 * create-student-institute-enrollment
 * body: { studentId, instituteId, isActive? }
 * returns: { studentInstituteEnrollment }
 */
export async function createStudentInstituteEnrollment(
  payload: CreateStudentInstituteEnrollmentPayload,
): Promise<Student_institute_enrollments> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke("create-student-institute-enrollment", {
    body: payload,
  })
  if (error) throw error
  if (!data?.studentInstituteEnrollment) {
    throw new Error("create-student-institute-enrollment returned no studentInstituteEnrollment")
  }
  return mapStudentInstituteEnrollmentRow(
    data.studentInstituteEnrollment as DbRow<Student_institute_enrollments>,
  )
}
/**
 * delete-student-institute-enrollment
 * body: { studentId, instituteId }
 * returns: { studentInstituteEnrollment }
 */
export async function deleteStudentInstituteEnrollment(
  payload: DeleteStudentInstituteEnrollmentPayload,
): Promise<Student_institute_enrollments> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke("delete-student-institute-enrollment", {
    body: payload,
  })
  if (error) throw error
  if (!data?.studentInstituteEnrollment) {
    throw new Error("delete-student-institute-enrollment returned no studentInstituteEnrollment")
  }
  return mapStudentInstituteEnrollmentRow(
    data.studentInstituteEnrollment as DbRow<Student_institute_enrollments>,
  )
}



export async function getAllStudentInstituteEnrollmentsByInstituteId(
  instituteId: string,
): Promise<Student_institute_enrollments[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("student_institute_enrollments")
    .select(`
      student_id,
      institute_id,
      is_active,
      created_at,
      updated_at
    `)
    .eq("institute_id", instituteId)
  if (error) throw error
  if (!data?.length) return []
  return data.map((row) =>
    mapStudentInstituteEnrollmentRow(row as DbRow<Student_institute_enrollments>),
  )
}


export type CreateStudentSubjectPayload = {
  studentId: string
  subjectId: string
  isActive?: boolean // optional, backend defaults true
}
export type DeleteStudentSubjectPayload = {
  studentId: string
  subjectId: string
}
function mapStudentSubjectRow(row: DbRow<Student_subject>): Student_subject {
  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }
}
/**
 * create-student-subject
 * body: { studentId, subjectId, isActive? }
 * returns: { studentSubject }
 */
export async function createStudentSubject(
  payload: CreateStudentSubjectPayload,
): Promise<Student_subject> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke("create-student-subject", {
    body: payload,
  })
  if (error) throw error
  if (!data?.studentSubject) {
    throw new Error("create-student-subject returned no studentSubject")
  }
  return mapStudentSubjectRow(data.studentSubject as DbRow<Student_subject>)
}
/**
 * delete-student-subject
 * body: { studentId, subjectId }
 * returns: { studentSubject }
 */
export async function deleteStudentSubject(
  payload: DeleteStudentSubjectPayload,
): Promise<Student_subject> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke("delete-student-subject", {
    body: payload,
  })
  if (error) throw error
  if (!data?.studentSubject) {
    throw new Error("delete-student-subject returned no studentSubject")
  }
  return mapStudentSubjectRow(data.studentSubject as DbRow<Student_subject>)
}

export async function getAllStudentSubjectsByStudentId(
  studentId: string,
): Promise<Student_subject[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("student_subjects")
    .select(`
      student_id,
      subject_id,
      is_active,
      created_at,
      updated_at
    `)
    .eq("student_id", studentId)
  if (error) throw error
  if (!data?.length) return []
  return data.map((row) => mapStudentSubjectRow(row as DbRow<Student_subject>))
}
export async function getAllStudentSubjectsBySubjectId(
  subjectId: string,
): Promise<Student_subject[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("student_subjects")
    .select(`
      student_id,
      subject_id,
      is_active,
      created_at,
      updated_at
    `)
    .eq("subject_id", subjectId)
  if (error) throw error
  if (!data?.length) return []
  return data.map((row) => mapStudentSubjectRow(row as DbRow<Student_subject>))
}