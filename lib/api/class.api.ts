// app/lib/api/classes.ts
import { Class, Student_Class } from "@/app/types/class"
import { getSupabaseBrowserClient } from "../supabase/client"
import type { DbRow } from "./db-row"

type Day =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY"

type Frequency = "WEEKLY" | "OTHER"

export type CreateClassPayload = {
  name: string
  classRoomId: string
  instituteId: string
  teacherId: string
  subjectId: string
  grade: string
  startTime: number
  endTime: number
  frequency: Frequency
  day: Day
  classFee: number
}

export type UpdateClassPayload = {
  classId: string
  name: string
  classRoomId: string
  teacherId: string
  subjectId: string
  grade: string
  startTime: number
  endTime: number
  frequency: Frequency
  day: Day
  classFee: number
}

function mapClassRow(row: DbRow<Class>): Class {
  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }
}

/**
 * create-class
 * body: CreateClassPayload
 * returns: { class }
 */
export async function createClass(payload: CreateClassPayload): Promise<Class> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke("create-class", {
    body: payload,
  })

  if (error) throw error
  if (!data?.class) throw new Error("create-class returned no class")

  return mapClassRow(data.class as DbRow<Class>)
}

/**
 * update-class
 * body: UpdateClassPayload
 * returns: { class }
 */
export async function updateClass(payload: UpdateClassPayload): Promise<Class> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke("update-class", {
    body: payload,
  })

  if (error) throw error
  if (!data?.class) throw new Error("update-class returned no class")

  return mapClassRow(data.class as DbRow<Class>)
}

/**
 * Get all active classes by institute_id
 */
export async function getAllClassesByInstituteId(instituteId: string): Promise<Class[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("classes")
    .select(`
      id,
      name,
      class_room_id,
      institute_id,
      teacher_id,
      subject_id,
      grade,
      start_time,
      end_time,
      frequency,
      day,
      class_fee,
      is_active,
      created_at,
      updated_at
    `)
    .eq("institute_id", instituteId)
    .eq("is_active", true)

  if (error) throw error
  if (!data?.length) return []

  return data.map((row) => mapClassRow(row as DbRow<Class>))
}

/**
 * Get one class by class id
 */
export async function getClassById(classId: string): Promise<Class | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("classes")
    .select(`
      id,
      name,
      class_room_id,
      institute_id,
      teacher_id,
      subject_id,
      grade,
      start_time,
      end_time,
      frequency,
      day,
      class_fee,
      is_active,
      created_at,
      updated_at
    `)
    .eq("id", classId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return mapClassRow(data as DbRow<Class>)
}


export type CreateStudentClassPayload = {
    studentId: string
    classId: string
    isActive?: boolean // optional, backend defaults true
  }
  export type DeleteStudentClassPayload = {
    studentId: string
    classId: string
  }
  function mapStudentClassRow(row: DbRow<Student_Class>): Student_Class {
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    }
  }
  /**
   * create-student-class
   * body: Array<{ studentId, classId, isActive? }>
   * returns: { studentClasses }
   */
  export async function createStudentClasses(
    payload: CreateStudentClassPayload[],
  ): Promise<Student_Class[]> {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.functions.invoke("create-student-class", {
      body: payload,
    })
    if (error) throw error
    if (!data?.studentClasses || !Array.isArray(data.studentClasses)) {
      throw new Error("create-student-class returned no studentClasses")
    }
    return data.studentClasses.map((row: unknown) =>
      mapStudentClassRow(row as DbRow<Student_Class>),
    )
  }
  /**
   * delete-student-class
   * body: { studentId, classId }
   * returns: { studentClass }
   */
  export async function deleteStudentClasses(
    payload: DeleteStudentClassPayload[],
  ): Promise<Student_Class[]> {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.functions.invoke("delete-student-class", {
      body: payload,
    })
    if (error) throw error
    if (!data?.studentClasses || !Array.isArray(data.studentClasses)) {
      throw new Error("delete-student-class returned no studentClasses")
    }
    return data.studentClasses.map((row: unknown) =>
      mapStudentClassRow(row as DbRow<Student_Class>),
    )
  }

export async function getAllStudentClassesByClassId(
  classId: string,
): Promise<Student_Class[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("student_classes")
    .select(`
      student_id,
      class_id,
      is_active,
      created_at,
      updated_at
    `)
    .eq("class_id", classId)
    .eq("is_active", true)

  if (error) throw error
  if (!data?.length) return []

  return data.map((row) => mapStudentClassRow(row as DbRow<Student_Class>))
}