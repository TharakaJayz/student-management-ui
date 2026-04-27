"use client"

import React from "react"
import { toast } from "sonner"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { getAllStudentClassAttendancesByClassId, getAllStudentClassMonthlyPaymentsByClassId } from "@/lib/api/attendance.api"
import { getAllClassesByInstituteId, getAllStudentClassesByClassIds } from "@/lib/api/class.api"
import { getInstituteByOwnerId } from "@/lib/api/institute-settings.api"
import AttendanceView from "./AttendanceView"
import type { AttendanceClassCard } from "./AttendanceView"

const getDayKeyFromDate = (date: Date) =>
  date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()

const normalizeAttendanceDayKey = (attendanceDate: number) => {
  if (attendanceDate >= 10000000 && attendanceDate <= 99999999) {
    return attendanceDate
  }
  if (attendanceDate > 1000000000000) {
    return getDayKeyFromDate(new Date(attendanceDate))
  }
  if (attendanceDate > 1000000000) {
    return getDayKeyFromDate(new Date(attendanceDate * 1000))
  }
  return attendanceDate
}

const AttendanceContainer = () => {
  const [isLoading, setIsLoading] = React.useState(true)
  const [cards, setCards] = React.useState<AttendanceClassCard[]>([])

  React.useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)
      try {
        const {
          data: { user },
        } = await getSupabaseBrowserClient().auth.getUser()

        if (!user || cancelled) return

        const institute = await getInstituteByOwnerId(user.id)
        if (!institute || cancelled) {
          if (!cancelled) setCards([])
          return
        }

        const allClasses = await getAllClassesByInstituteId(institute.id)
        const studentClasses = await getAllStudentClassesByClassIds(allClasses.map((item) => item.id))
        const studentCountByClassId = studentClasses.reduce<Record<string, number>>((accumulator, row) => {
          accumulator[row.class_id] = (accumulator[row.class_id] ?? 0) + 1
          return accumulator
        }, {})

        const todayKey = getDayKeyFromDate(new Date())
        const currentMonth = new Date().toISOString().slice(0, 7)

        const cardResults = await Promise.all(
          allClasses.map(async (item) => {
            const [attendances, monthlyPayments] = await Promise.all([
              getAllStudentClassAttendancesByClassId(item.id),
              getAllStudentClassMonthlyPaymentsByClassId(item.id),
            ])

            const todaysAttendances = attendances.filter(
              (attendance) => normalizeAttendanceDayKey(attendance.attendance_date) === todayKey
            )
            const presentStudents = todaysAttendances.filter((attendance) => attendance.is_present).length
            const totalStudents = studentCountByClassId[item.id] ?? 0
            const absentStudents = Math.max(totalStudents - presentStudents, 0)

            const monthlyPaymentsForCurrentMonth = monthlyPayments.filter(
              (payment) => payment.billing_month === currentMonth && payment.is_active
            )
            const paidStudents = monthlyPaymentsForCurrentMonth.filter(
              (payment) => payment.payment_status === "PAID"
            ).length
            const pendingPayments = monthlyPaymentsForCurrentMonth.filter(
              (payment) => payment.payment_status !== "PAID"
            ).length
            const totalCollectedAmount = monthlyPaymentsForCurrentMonth.reduce(
              (accumulator, payment) => accumulator + payment.payment_amount,
              0
            )

            return {
              classId: item.id,
              className: item.name,
              grade: item.grade,
              day: item.day,
              startTime: item.start_time,
              endTime: item.end_time,
              totalStudents,
              presentStudents,
              absentStudents,
              paidStudents,
              pendingPayments,
              totalCollectedAmount,
              isHeld: presentStudents > 0,
            } satisfies AttendanceClassCard
          })
        )

        if (!cancelled) {
          setCards(cardResults)
        }
      } catch (error) {
        console.error("Failed to load attendance queue", error)
        if (!cancelled) {
          setCards([])
          toast.error("Could not load attendance queue")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const totalClasses = cards.length
  const totalStudentsAttended = cards.reduce((accumulator, item) => accumulator + item.presentStudents, 0)
  const totalAmountReceived = cards.reduce((accumulator, item) => accumulator + item.totalCollectedAmount, 0)
  const heldClasses = cards.filter((item) => item.isHeld)
  const upcomingClasses = cards.filter((item) => !item.isHeld)

  return (
    <div>
      <AttendanceView
        dateLabel={new Date().toLocaleDateString()}
        totalClasses={totalClasses}
        totalStudentsAttended={totalStudentsAttended}
        totalAmountReceived={totalAmountReceived}
        heldClasses={heldClasses}
        upcomingClasses={upcomingClasses}
        isLoading={isLoading}
      />
    </div>
  )
}

export default AttendanceContainer
