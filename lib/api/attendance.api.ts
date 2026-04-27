// app/lib/api/attendance.api.ts
// Adjust the type import path below to your project structure.
import type {
    Student_class_attendances,
    Student_class_monthly_payments,
  } from "@/app/types/attendance"
  import { getSupabaseBrowserClient } from "../supabase/client"
  import type { DbRow } from "./db-row"
  
  type PaymentStatus = "PENDING" | "PAID" | "FAILED"
  
  export type CreateStudentClassMonthlyPaymentPayload = {
    billingMonth: string
    studentId: string
    grade: string
    classId: string
    instituteId: string
    amountDue: number
    paymentAmount: number
    paymentStatus: PaymentStatus
    isActive?: boolean
  }
  
  export type UpdateStudentClassMonthlyPaymentPayload = {
    billingMonth: string
    studentId: string
    grade: string
    classId: string
    instituteId: string
    amountDue: number
    paymentAmount: number
    paymentStatus: PaymentStatus
    isActive: boolean
  }
  
  export type DeleteStudentClassMonthlyPaymentPayload = {
    billingMonth: string
    studentId: string
    classId: string
  }
  
  export type UpdateStudentClassAttendancePayload = {
    studentId: string
    classId: string
    attendanceDate: number
    isPresent: boolean
    isActive: boolean
  }
  
  function mapStudentClassAttendanceRow(
    row: DbRow<Student_class_attendances>,
  ): Student_class_attendances {
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    }
  }
  
  function mapStudentClassMonthlyPaymentRow(
    row: DbRow<Student_class_monthly_payments>,
  ): Student_class_monthly_payments {
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    }
  }
  
  /**
   * create-student-class-monthly-payment
   * body: CreateStudentClassMonthlyPaymentPayload
   * returns: { studentClassMonthlyPayment }
   */
  export async function createStudentClassMonthlyPayment(
    payload: CreateStudentClassMonthlyPaymentPayload,
  ): Promise<Student_class_monthly_payments> {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.functions.invoke("create-student-class-monthly-payment", {
      body: payload,
    })
  
    if (error) throw error
    if (!data?.studentClassMonthlyPayment) {
      throw new Error("create-student-class-monthly-payment returned no studentClassMonthlyPayment")
    }
  
    return mapStudentClassMonthlyPaymentRow(
      data.studentClassMonthlyPayment as DbRow<Student_class_monthly_payments>,
    )
  }
  
  /**
   * update-student-class-monthly-payment
   * body: UpdateStudentClassMonthlyPaymentPayload
   * returns: { studentClassMonthlyPayment }
   */
  export async function updateStudentClassMonthlyPayment(
    payload: UpdateStudentClassMonthlyPaymentPayload,
  ): Promise<Student_class_monthly_payments> {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.functions.invoke("update-student-class-monthly-payment", {
      body: payload,
    })
  
    if (error) throw error
    if (!data?.studentClassMonthlyPayment) {
      throw new Error("update-student-class-monthly-payment returned no studentClassMonthlyPayment")
    }
  
    return mapStudentClassMonthlyPaymentRow(
      data.studentClassMonthlyPayment as DbRow<Student_class_monthly_payments>,
    )
  }
  
  /**
   * delete-student-class-monthly-payment
   * body: DeleteStudentClassMonthlyPaymentPayload
   * returns: { studentClassMonthlyPayment }
   */
  export async function deleteStudentClassMonthlyPayment(
    payload: DeleteStudentClassMonthlyPaymentPayload,
  ): Promise<Student_class_monthly_payments> {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.functions.invoke("delete-student-class-monthly-payment", {
      body: payload,
    })
  
    if (error) throw error
    if (!data?.studentClassMonthlyPayment) {
      throw new Error("delete-student-class-monthly-payment returned no studentClassMonthlyPayment")
    }
  
    return mapStudentClassMonthlyPaymentRow(
      data.studentClassMonthlyPayment as DbRow<Student_class_monthly_payments>,
    )
  }
  
  /**
   * update-student-class-attendance
   * body: UpdateStudentClassAttendancePayload
   * returns: { studentClassAttendance }
   */
  export async function updateStudentClassAttendance(
    payload: UpdateStudentClassAttendancePayload,
  ): Promise<Student_class_attendances> {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.functions.invoke("update-student-class-attendance", {
      body: payload,
    })
  
    if (error) throw error
    if (!data?.studentClassAttendance) {
      throw new Error("update-student-class-attendance returned no studentClassAttendance")
    }
  
    return mapStudentClassAttendanceRow(
      data.studentClassAttendance as DbRow<Student_class_attendances>,
    )
  }
  
  /**
   * Get all student class attendances by class_id
   */
  export async function getAllStudentClassAttendancesByClassId(
    classId: string,
  ): Promise<Student_class_attendances[]> {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("student_class_attendances")
      .select(`
        student_id,
        class_id,
        attendance_date,
        is_present,
        is_active,
        created_at,
        updated_at
      `)
      .eq("class_id", classId)
  
    if (error) throw error
    if (!data?.length) return []
  
    return data.map((row) =>
      mapStudentClassAttendanceRow(row as DbRow<Student_class_attendances>),
    )
  }
  
  /**
   * Get all student class attendances by student_id
   */
  export async function getStudentClassAttendancesByStudentId(
    studentId: string,
  ): Promise<Student_class_attendances[]> {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("student_class_attendances")
      .select(`
        student_id,
        class_id,
        attendance_date,
        is_present,
        is_active,
        created_at,
        updated_at
      `)
      .eq("student_id", studentId)
  
    if (error) throw error
    if (!data?.length) return []
  
    return data.map((row) =>
      mapStudentClassAttendanceRow(row as DbRow<Student_class_attendances>),
    )
  }
  
  /**
   * Get all student class monthly payments by class_id
   */
  export async function getAllStudentClassMonthlyPaymentsByClassId(
    classId: string,
  ): Promise<Student_class_monthly_payments[]> {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("student_class_monthly_payments")
      .select(`
        billing_month,
        student_id,
        grade,
        class_id,
        institute_id,
        amount_due,
        payment_amount,
        payment_status,
        is_active,
        created_at,
        updated_at
      `)
      .eq("class_id", classId)
  
    if (error) throw error
    if (!data?.length) return []
  
    return data.map((row) =>
      mapStudentClassMonthlyPaymentRow(row as DbRow<Student_class_monthly_payments>),
    )
  }
  
  /**
   * Get all student class monthly payments by student_id
   */
  export async function getStudentClassMonthlyPaymentsByStudentId(
    studentId: string,
  ): Promise<Student_class_monthly_payments[]> {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("student_class_monthly_payments")
      .select(`
        billing_month,
        student_id,
        grade,
        class_id,
        institute_id,
        amount_due,
        payment_amount,
        payment_status,
        is_active,
        created_at,
        updated_at
      `)
      .eq("student_id", studentId)
  
    if (error) throw error
    if (!data?.length) return []
  
    return data.map((row) =>
      mapStudentClassMonthlyPaymentRow(row as DbRow<Student_class_monthly_payments>),
    )
  }