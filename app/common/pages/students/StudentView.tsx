"use client"

import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Search } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
import type { Student } from "@/app/types/students"

const studentFormSchema = z.object({
  name: z.string().min(2, "Name should be at least 2 characters"),
  age: z.number().int().min(3, "Age should be at least 3"),
  image_url: z.string().url("Provide a valid image URL"),
  grade: z.string().min(1, "Grade is required"),
  is_active: z.enum(["true", "false"]),
})

type StudentFormInput = z.input<typeof studentFormSchema>
export type StudentFormValues = z.output<typeof studentFormSchema>

export type StudentMutationPayload =
  | { mode: "create"; data: StudentFormValues }
  | { mode: "update"; id: string; data: StudentFormValues }

export interface StudentViewProps {
  students: Student[]
  subjects: SubjectOption[]
  gradeSelectOptions: readonly string[]
  onSubmitStudent: (payload: StudentMutationPayload) => void | Promise<void>
  assignedStudentIds: string[]
  onAssignStudent: (student: Student) => void | Promise<void>
  onUnassignStudent: (student: Student) => void | Promise<void>
  assignmentPendingStudentId?: string | null
  onOpenStudentSubjects: (student: Student) => Promise<string[]>
  onSaveStudentSubjects: (
    student: Student,
    nextSubjectIds: string[],
    previousSubjectIds: string[]
  ) => Promise<void>
}

export interface SubjectOption {
  id: string
  name: string
}

const getGradeNumber = (grade: string) => {
  const match = grade.match(/\d+/)
  return match ? Number(match[0]) : Number.NaN
}

const StudentView = ({
  students,
  subjects,
  gradeSelectOptions,
  onSubmitStudent,
  assignedStudentIds,
  onAssignStudent,
  onUnassignStudent,
  assignmentPendingStudentId = null,
  onOpenStudentSubjects,
  onSaveStudentSubjects,
}: StudentViewProps) => {
  const [searchValue, setSearchValue] = React.useState("")
  const [gradeFilter, setGradeFilter] = React.useState("all")
  const [assignmentFilter, setAssignmentFilter] = React.useState<
    "all" | "assigned" | "unassigned"
  >("all")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isStudentSaving, setIsStudentSaving] = React.useState(false)
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null)
  const [assignTarget, setAssignTarget] = React.useState<Student | null>(null)
  const [unassignTarget, setUnassignTarget] = React.useState<Student | null>(null)
  const [subjectsTarget, setSubjectsTarget] = React.useState<Student | null>(null)
  const [isStudentSubjectsLoading, setIsStudentSubjectsLoading] = React.useState(false)
  const [isStudentSubjectsSaving, setIsStudentSubjectsSaving] = React.useState(false)
  const [studentSubjectsOriginalIds, setStudentSubjectsOriginalIds] = React.useState<string[]>([])
  const [studentSubjectsSelectedIds, setStudentSubjectsSelectedIds] = React.useState<string[]>([])
  const [subjectPickerValue, setSubjectPickerValue] = React.useState("")

  const form = useForm<StudentFormInput, unknown, StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      age: 10,
      image_url: "",
      grade: "",
      is_active: "true",
    },
  })

  const activeStudents = React.useMemo(
    () => students.filter((student) => student.is_active),
    [students]
  )
  const assignedStudentIdSet = React.useMemo(
    () => new Set(assignedStudentIds),
    [assignedStudentIds]
  )
  const subjectNameById = React.useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject.name])),
    [subjects]
  )

  const gradeSummary = React.useMemo(() => {
    return activeStudents.reduce(
      (accumulator, student) => {
        const gradeNumber = getGradeNumber(student.grade)

        if (gradeNumber >= 1 && gradeNumber <= 5) {
          accumulator.primary += 1
        } else if (gradeNumber >= 6 && gradeNumber <= 9) {
          accumulator.middle += 1
        } else if (gradeNumber >= 10 && gradeNumber <= 13) {
          accumulator.secondary += 1
        }

        return accumulator
      },
      { primary: 0, middle: 0, secondary: 0 }
    )
  }, [activeStudents])

  const gradeOptions = React.useMemo(() => {
    return Array.from(new Set(students.map((student) => student.grade))).sort((a, b) =>
      getGradeNumber(a) - getGradeNumber(b)
    )
  }, [students])

  const filteredStudents = React.useMemo(() => {
    const normalizedSearch = searchValue.toLowerCase().trim()

    return students.filter((student) => {
      const matchesGrade = gradeFilter === "all" || student.grade === gradeFilter
      if (!matchesGrade) return false

      const matchesAssignment =
        assignmentFilter === "all" ||
        (assignmentFilter === "assigned" && assignedStudentIdSet.has(student.id)) ||
        (assignmentFilter === "unassigned" && !assignedStudentIdSet.has(student.id))
      if (!matchesAssignment) return false

      if (!normalizedSearch) return true

      return (
        student.name.toLowerCase().includes(normalizedSearch) ||
        student.grade.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [students, searchValue, gradeFilter, assignmentFilter, assignedStudentIdSet])

  const openCreateDialog = () => {
    setEditingStudent(null)
    form.reset({
      name: "",
      age: 10,
      image_url: "",
      grade: "",
      is_active: "true",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = React.useCallback((student: Student) => {
    setEditingStudent(student)
    form.reset({
      name: student.name,
      age: student.age,
      image_url: student.image_url,
      grade: student.grade,
      is_active: String(student.is_active) as "true" | "false",
    })
    setIsDialogOpen(true)
  }, [form])

  const onSubmit = async (data: StudentFormValues) => {
    setIsStudentSaving(true)
    try {
      if (editingStudent) {
        await onSubmitStudent({ mode: "update", id: editingStudent.id, data })
      } else {
        await onSubmitStudent({ mode: "create", data })
      }

      setIsDialogOpen(false)
      setEditingStudent(null)
      form.reset()
    } finally {
      setIsStudentSaving(false)
    }
  }

  const handleConfirmAssign = async () => {
    if (!assignTarget) return
    await onAssignStudent(assignTarget)
    setAssignTarget(null)
  }

  const handleConfirmUnassign = async () => {
    if (!unassignTarget) return
    await onUnassignStudent(unassignTarget)
    setUnassignTarget(null)
  }

  const openManageSubjectsDialog = async (student: Student) => {
    setSubjectsTarget(student)
    setSubjectPickerValue("")
    setIsStudentSubjectsLoading(true)
    try {
      const existingSubjectIds = await onOpenStudentSubjects(student)
      setStudentSubjectsOriginalIds(existingSubjectIds)
      setStudentSubjectsSelectedIds(existingSubjectIds)
    } finally {
      setIsStudentSubjectsLoading(false)
    }
  }

  const handleAddSubjectToSelection = () => {
    if (!subjectPickerValue) return
    setStudentSubjectsSelectedIds((previous) =>
      previous.includes(subjectPickerValue) ? previous : [...previous, subjectPickerValue]
    )
    setSubjectPickerValue("")
  }

  const handleRemoveSubjectFromSelection = (subjectId: string) => {
    setStudentSubjectsSelectedIds((previous) => previous.filter((id) => id !== subjectId))
  }

  const handleSaveStudentSubjects = async () => {
    if (!subjectsTarget) return
    setIsStudentSubjectsSaving(true)
    try {
      await onSaveStudentSubjects(
        subjectsTarget,
        studentSubjectsSelectedIds,
        studentSubjectsOriginalIds
      )
      setSubjectsTarget(null)
      setStudentSubjectsOriginalIds([])
      setStudentSubjectsSelectedIds([])
      setSubjectPickerValue("")
    } finally {
      setIsStudentSubjectsSaving(false)
    }
  }

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "age",
      header: "Age",
    },
    {
      accessorKey: "grade",
      header: "Grade",
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (row.original.is_active ? "Active" : "Inactive"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const student = row.original
        const isAssigned = assignedStudentIdSet.has(student.id)
        const isPending = assignmentPendingStudentId === student.id
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => openEditDialog(student)}
            >
              Edit
            </Button>
            <Button
              variant={isAssigned ? "outline" : "default"}
              size="sm"
              type="button"
              disabled={isPending}
              onClick={() => (isAssigned ? setUnassignTarget(student) : setAssignTarget(student))}
            >
              {isPending ? "Saving..." : isAssigned ? "Unassign" : "Assign"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => void openManageSubjectsDialog(student)}
            >
              Subjects
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredStudents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  React.useEffect(() => {
    table.setPageIndex(0)
  }, [searchValue, gradeFilter, assignmentFilter, table])

  return (
    <div className="space-y-6 px-1 py-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Total Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-foreground">{activeStudents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">
              Primary Students (Grade 1 - 5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-foreground">{gradeSummary.primary}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">
              Middle Students (Grade 6 - 9)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-foreground">{gradeSummary.middle}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">
              Secondary Students (Grade 10 - 13)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-foreground">{gradeSummary.secondary}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="py-0">
        <CardHeader className="flex flex-col gap-3 border-b py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 md:max-w-xl md:flex-row">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students by name or grade..."
                className="pl-9"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Filter by grade" />
              </SelectTrigger>
              <SelectContent className="max-h-52 overflow-y-auto">
                <SelectItem value="all">All Grades</SelectItem>
                {gradeOptions.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={assignmentFilter}
              onValueChange={(value: "all" | "assigned" | "unassigned") =>
                setAssignmentFilter(value)
              }
            >
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Filter by assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All students</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={openCreateDialog}>
            Create Student
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          Showing {table.getRowModel().rows.length} of {filteredStudents.length} filtered students
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open && isStudentSaving) return
          setIsDialogOpen(open)
          if (!open) {
            setEditingStudent(null)
            form.reset()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStudent ? "Edit Student" : "Create Student"}</DialogTitle>
            <DialogDescription>
              {editingStudent
                ? "Update student information and save changes."
                : "Fill in student details to create a new record."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Student name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={3}
                          placeholder="10"
                          value={field.value}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                          <SelectContent className="max-h-52 overflow-y-auto">
                            {gradeSelectOptions.map((grade) => (
                              <SelectItem key={grade} value={grade}>
                                {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Status</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isStudentSaving}
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isStudentSaving}>
                  {editingStudent
                    ? isStudentSaving
                      ? "Updating..."
                      : "Update Student"
                    : isStudentSaving
                      ? "Creating..."
                      : "Create Student"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(assignTarget)} onOpenChange={(open) => !open && setAssignTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign student</DialogTitle>
            <DialogDescription>
              Assign this student to the current institute?
            </DialogDescription>
          </DialogHeader>
          {assignTarget ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Student:</span> {assignTarget.name}
              </p>
              <p>
                <span className="text-muted-foreground">Age:</span> {assignTarget.age}
              </p>
              <p>
                <span className="text-muted-foreground">Grade:</span> {assignTarget.grade}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAssignTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={assignmentPendingStudentId === assignTarget?.id}
              onClick={() => void handleConfirmAssign()}
            >
              {assignmentPendingStudentId === assignTarget?.id ? "Assigning..." : "Confirm Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(unassignTarget)}
        onOpenChange={(open) => !open && setUnassignTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unassign student</DialogTitle>
            <DialogDescription>
              This removes the student from this institute assignment.
            </DialogDescription>
          </DialogHeader>
          {unassignTarget ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Student:</span> {unassignTarget.name}
              </p>
              <p>
                <span className="text-muted-foreground">Age:</span> {unassignTarget.age}
              </p>
              <p>
                <span className="text-muted-foreground">Grade:</span> {unassignTarget.grade}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUnassignTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={assignmentPendingStudentId === unassignTarget?.id}
              onClick={() => void handleConfirmUnassign()}
            >
              {assignmentPendingStudentId === unassignTarget?.id
                ? "Unassigning..."
                : "Confirm Unassign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(subjectsTarget)}
        onOpenChange={(open) => {
          if (!open && isStudentSubjectsSaving) return
          if (!open) {
            setSubjectsTarget(null)
            setStudentSubjectsOriginalIds([])
            setStudentSubjectsSelectedIds([])
            setSubjectPickerValue("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage student subjects</DialogTitle>
            <DialogDescription>
              Add or remove subjects for this student.
            </DialogDescription>
          </DialogHeader>

          {subjectsTarget ? (
            <div className="space-y-4">
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Student:</span> {subjectsTarget.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Grade:</span> {subjectsTarget.grade}
                </p>
              </div>

              {isStudentSubjectsLoading ? (
                <p className="text-sm text-muted-foreground">Loading assigned subjects...</p>
              ) : (
                <>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Select value={subjectPickerValue} onValueChange={setSubjectPickerValue}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select subject to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      className="sm:w-auto"
                      disabled={!subjectPickerValue}
                      onClick={handleAddSubjectToSelection}
                    >
                      Add Subject
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Selected subjects
                    </p>
                    {studentSubjectsSelectedIds.length ? (
                      <div className="flex flex-wrap gap-2">
                        {studentSubjectsSelectedIds.map((subjectId) => (
                          <div
                            key={subjectId}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm"
                          >
                            <span>{subjectNameById.get(subjectId) ?? "Unknown Subject"}</span>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => handleRemoveSubjectFromSelection(subjectId)}
                              aria-label="Remove selected subject"
                            >
                              x
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No subjects selected.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isStudentSubjectsSaving}
              onClick={() => setSubjectsTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isStudentSubjectsLoading || isStudentSubjectsSaving}
              onClick={() => void handleSaveStudentSubjects()}
            >
              {isStudentSubjectsSaving ? "Saving..." : "Save Subjects"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StudentView