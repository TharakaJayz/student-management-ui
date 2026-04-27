"use client"

import React from "react"
import { toast } from "sonner"

import type { Student } from "@/app/types/students"
import {
  getAllStudentClassAttendancesByClassId,
  getAllStudentClassMonthlyPaymentsByClassId,
  updateStudentClassAttendance,
  updateStudentClassMonthlyPayment,
} from "@/lib/api/attendance.api"
import { getClassById, getAllStudentClassesByClassId } from "@/lib/api/class.api"
import { getAllStudentsByInstituteId } from "@/lib/api/students.api"
import AttendanceClassView from "./AttendanceClassView"
import type { AttendanceStudentRow } from "./AttendanceClassView"

type AttendanceClassContainerProps = {
  classId: string
}

const getDayKeyFromDate = (date: Date) =>
  date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()

const AttendanceClassContainer = ({ classId }: AttendanceClassContainerProps) => {
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchValue, setSearchValue] = React.useState("")
  const [rows, setRows] = React.useState<AttendanceStudentRow[]>([])
  const [classMeta, setClassMeta] = React.useState<{
    name: string
    grade: string
    day: string
    startTime: number
    endTime: number
    instituteId: string
    classFee: number
  } | null>(null)
  const [attendanceSavingStudentId, setAttendanceSavingStudentId] = React.useState<string | null>(null)
  const [paymentSavingStudentId, setPaymentSavingStudentId] = React.useState<string | null>(null)
  const [studentsById, setStudentsById] = React.useState<Record<string, Student>>({})

  React.useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)
      try {
        const classInfo = await getClassById(classId)
        if (!classInfo || cancelled) {
          if (!cancelled) {
            setClassMeta(null)
            setRows([])
            toast.error("Class not found")
          }
          return
        }

        const [studentClasses, allStudents, attendances, monthlyPayments] = await Promise.all([
          getAllStudentClassesByClassId(classInfo.id),
          getAllStudentsByInstituteId(classInfo.institute_id),
          getAllStudentClassAttendancesByClassId(classInfo.id),
          getAllStudentClassMonthlyPaymentsByClassId(classInfo.id),
        ])

        const classStudentIds = new Set(studentClasses.map((row) => row.student_id))
        const classStudents = allStudents.filter((student) => classStudentIds.has(student.id))
        const nextStudentsById = classStudents.reduce<Record<string, Student>>((accumulator, student) => {
          accumulator[student.id] = student
          return accumulator
        }, {})

        const todayKey = getDayKeyFromDate(new Date())
        const currentMonth = new Date().toISOString().slice(0, 7)

        const attendanceByStudentId = attendances.reduce<Record<string, boolean>>((accumulator, attendance) => {
          if (attendance.attendance_date === todayKey) {
            accumulator[attendance.student_id] = attendance.is_present
          }
          return accumulator
        }, {})

        const paymentByStudentId = monthlyPayments.reduce<
          Record<
            string,
            {
              paymentStatus: "PENDING" | "PAID" | "FAILED"
              paymentAmount: number
              amountDue: number
            }
          >
        >((accumulator, payment) => {
          if (payment.billing_month === currentMonth && payment.is_active) {
            accumulator[payment.student_id] = {
              paymentStatus: payment.payment_status,
              paymentAmount: payment.payment_amount,
              amountDue: payment.amount_due,
            }
          }
          return accumulator
        }, {})

        const initialRows = classStudents.map((student) => {
          const payment = paymentByStudentId[student.id]
          return {
            studentId: student.id,
            name: student.name,
            imageUrl: student.image_url,
            attendancePresent: Boolean(attendanceByStudentId[student.id]),
            paymentStatus: payment?.paymentStatus ?? "PENDING",
            paymentAmount: payment?.paymentAmount ?? 0,
            amountDue: payment?.amountDue ?? classInfo.class_fee,
          } satisfies AttendanceStudentRow
        })

        if (!cancelled) {
          setClassMeta({
            name: classInfo.name,
            grade: classInfo.grade,
            day: classInfo.day,
            startTime: classInfo.start_time,
            endTime: classInfo.end_time,
            instituteId: classInfo.institute_id,
            classFee: classInfo.class_fee,
          })
          setStudentsById(nextStudentsById)
          setRows(initialRows)
        }
      } catch (error) {
        console.error("Failed to load class attendance details", error)
        if (!cancelled) {
          setRows([])
          toast.error("Could not load class attendance details")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [classId])

  const handlePaymentStatusChange = (studentId: string, status: "PENDING" | "PAID" | "FAILED") => {
    setRows((previous) =>
      previous.map((row) => (row.studentId === studentId ? { ...row, paymentStatus: status } : row))
    )
  }

  const handleToggleAttendance = async (studentId: string) => {
    if (!classMeta) return
    const row = rows.find((item) => item.studentId === studentId)
    if (!row) return

    setAttendanceSavingStudentId(studentId)
    try {
      await updateStudentClassAttendance({
        studentId,
        classId,
        attendanceDate: getDayKeyFromDate(new Date()),
        isPresent: !row.attendancePresent,
        isActive: true,
      })
      setRows((previous) =>
        previous.map((item) =>
          item.studentId === studentId ? { ...item, attendancePresent: !item.attendancePresent } : item
        )
      )
      toast.success("Attendance updated")
    } catch (error) {
      console.error("Failed to update attendance", error)
      toast.error("Could not update attendance")
    } finally {
      setAttendanceSavingStudentId(null)
    }
  }

  const handleSavePayment = async (studentId: string) => {
    if (!classMeta) return
    const row = rows.find((item) => item.studentId === studentId)
    const student = studentsById[studentId]
    if (!row || !student) return

    setPaymentSavingStudentId(studentId)
    const payload = {
      billingMonth: new Date().toISOString().slice(0, 7),
      studentId,
      grade: student.grade,
      classId,
      instituteId: classMeta.instituteId,
      amountDue: row.amountDue || classMeta.classFee,
      paymentAmount: row.paymentAmount,
      paymentStatus: row.paymentStatus,
      isActive: true,
    }

    try {
      await updateStudentClassMonthlyPayment(payload)
      toast.success("Payment updated")
    } catch (error) {
      console.error("Failed to update payment", error)
      toast.error("Could not update payment")
    } finally {
      setPaymentSavingStudentId(null)
    }
  }

  const filteredRows = React.useMemo(() => {
    const normalizedSearch = searchValue.toLowerCase().trim()
    if (!normalizedSearch) return rows
    return rows.filter((row) => row.name.toLowerCase().includes(normalizedSearch))
  }, [rows, searchValue])

  const classTimeLabel = classMeta
    ? `${String(classMeta.startTime).padStart(2, "0")}:00 - ${String(classMeta.endTime).padStart(2, "0")}:00`
    : "--"

  return (
    <AttendanceClassView
      isLoading={isLoading}
      className={classMeta?.name ?? "Class Attendance"}
      classGrade={classMeta?.grade ?? "--"}
      classDay={classMeta?.day ?? "--"}
      classTimeLabel={classTimeLabel}
      rows={filteredRows}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onPaymentStatusChange={handlePaymentStatusChange}
      onToggleAttendance={handleToggleAttendance}
      onSavePayment={handleSavePayment}
      attendanceSavingStudentId={attendanceSavingStudentId}
      paymentSavingStudentId={paymentSavingStudentId}
    />
  )
}

export default AttendanceClassContainer
