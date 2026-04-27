"use client"

import React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type AttendanceStudentRow = {
  studentId: string
  name: string
  imageUrl: string
  attendancePresent: boolean
  paymentStatus: "PENDING" | "PAID" | "FAILED"
  paymentAmount: number
  amountDue: number
}

export type AttendanceClassViewProps = {
  isLoading: boolean
  className: string
  classGrade: string
  classDay: string
  classTimeLabel: string
  rows: AttendanceStudentRow[]
  searchValue: string
  onSearchValueChange: (value: string) => void
  onPaymentStatusChange: (studentId: string, status: "PENDING" | "PAID" | "FAILED") => void
  onToggleAttendance: (studentId: string) => Promise<void> | void
  onSavePayment: (studentId: string) => Promise<void> | void
  attendanceSavingStudentId?: string | null
  paymentSavingStudentId?: string | null
}

const AttendanceClassView = ({
  isLoading,
  className,
  classGrade,
  classDay,
  classTimeLabel,
  rows,
  searchValue,
  onSearchValueChange,
  onPaymentStatusChange,
  onToggleAttendance,
  onSavePayment,
  attendanceSavingStudentId = null,
  paymentSavingStudentId = null,
}: AttendanceClassViewProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Mark Attendance</CardTitle>
            <p className="text-sm text-muted-foreground">
              {className} | {classGrade} | {classDay} | {classTimeLabel}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/attendance">Back to Attendance</Link>
          </Button>
        </CardHeader>
      </Card>

      <Card className="py-0">
        <CardHeader className="border-b py-4">
          <div className="relative w-full md:max-w-sm">
            <Input
              placeholder="Search student by name..."
              value={searchValue}
              onChange={(event) => onSearchValueChange(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                    Loading students...
                  </TableCell>
                </TableRow>
              ) : rows.length ? (
                rows.map((row) => (
                  <TableRow key={row.studentId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {row.imageUrl ? (
                          <img
                            src={row.imageUrl}
                            alt={`${row.name} avatar`}
                            className="h-10 w-10 rounded-full border object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                            {row.name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium">{row.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          row.attendancePresent
                            ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700"
                        }
                      >
                        {row.attendancePresent ? "Present" : "Not Marked"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.paymentStatus}
                        onValueChange={(value: "PENDING" | "PAID" | "FAILED") =>
                          onPaymentStatusChange(row.studentId, value)
                        }
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PAID">Paid</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="FAILED">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">LKR {row.paymentAmount.toLocaleString()}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Due: LKR {row.amountDue.toLocaleString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={row.attendancePresent ? "outline" : "default"}
                          disabled={attendanceSavingStudentId === row.studentId}
                          onClick={() => void onToggleAttendance(row.studentId)}
                        >
                          {attendanceSavingStudentId === row.studentId
                            ? "Saving..."
                            : row.attendancePresent
                              ? "Mark Absent"
                              : "Mark Present"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={paymentSavingStudentId === row.studentId}
                          onClick={() => void onSavePayment(row.studentId)}
                        >
                          {paymentSavingStudentId === row.studentId ? "Saving..." : "Update Payment"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                    No students found for this class.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default AttendanceClassView
