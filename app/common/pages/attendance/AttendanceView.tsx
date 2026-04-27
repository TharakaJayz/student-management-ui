import React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type AttendanceClassCard = {
  classId: string
  className: string
  grade: string
  day: string
  startTime: number
  endTime: number
  totalStudents: number
  presentStudents: number
  absentStudents: number
  paidStudents: number
  pendingPayments: number
  totalCollectedAmount: number
  isHeld: boolean
}

export type AttendanceViewProps = {
  dateLabel: string
  totalClasses: number
  totalStudentsAttended: number
  totalAmountReceived: number
  heldClasses: AttendanceClassCard[]
  upcomingClasses: AttendanceClassCard[]
  isLoading?: boolean
}

const formatHour = (hour: number) => `${String(hour).padStart(2, "0")}:00`

const AttendanceView = ({
  dateLabel,
  totalClasses,
  totalStudentsAttended,
  totalAmountReceived,
  heldClasses,
  upcomingClasses,
  isLoading = false,
}: AttendanceViewProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Attendance Queue</CardTitle>
            <p className="text-sm text-muted-foreground">
              See classes to be held, finished attendance, and payment progress.
            </p>
          </div>
          <div className="rounded-md border bg-muted/40 px-3 py-1 text-sm text-muted-foreground">
            Date: {dateLabel}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Classes Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalClasses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Students Attended</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalStudentsAttended}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Amount Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">LKR {totalAmountReceived.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Classes To Be Held</h2>
          <span className="text-sm text-muted-foreground">{upcomingClasses.length} classes</span>
        </div>
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Loading attendance queue...
            </CardContent>
          </Card>
        ) : upcomingClasses.length ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {upcomingClasses.map((item) => (
              <Card key={item.classId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{item.className}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {item.grade} | {item.day} | {formatHour(item.startTime)} - {formatHour(item.endTime)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p className="text-muted-foreground">Students: {item.totalStudents}</p>
                    <p className="text-muted-foreground">Pending Payments: {item.pendingPayments}</p>
                    <p className="text-muted-foreground">Present: {item.presentStudents}</p>
                    <p className="text-muted-foreground">Absent: {item.absentStudents}</p>
                  </div>
                  <Button asChild>
                    <Link href={`/attendance/${item.classId}`}>Add Attendance</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No upcoming classes to mark attendance.
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Finished Classes</h2>
          <span className="text-sm text-muted-foreground">{heldClasses.length} classes</span>
        </div>
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Loading attendance queue...
            </CardContent>
          </Card>
        ) : heldClasses.length ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {heldClasses.map((item) => (
              <Card key={item.classId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{item.className}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {item.grade} | {item.day} | {formatHour(item.startTime)} - {formatHour(item.endTime)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p className="text-muted-foreground">Students: {item.totalStudents}</p>
                    <p className="text-muted-foreground">Paid: {item.paidStudents}</p>
                    <p className="text-muted-foreground">Present: {item.presentStudents}</p>
                    <p className="text-muted-foreground">Collected: LKR {item.totalCollectedAmount.toLocaleString()}</p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/attendance/${item.classId}`}>Edit Attendance</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No finished classes yet for today.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}

export default AttendanceView
