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

import type { Teacher } from "@/app/types/teacher"
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

const teacherFormSchema = z.object({
  name: z.string().min(2, "Name should be at least 2 characters"),
  mobile: z
    .string()
    .min(10, "Mobile should be at least 10 digits")
    .regex(/^\+?[0-9]+$/, "Use numbers only (optionally starting with +)"),
  subject_id: z.string().min(1, "Subject is required"),
  is_active: z.enum(["true", "false"]),
})

type TeacherFormInput = z.input<typeof teacherFormSchema>
export type TeacherFormValues = z.output<typeof teacherFormSchema>

export type TeacherMutationPayload =
  | { mode: "create"; data: TeacherFormValues }
  | { mode: "update"; id: string; data: TeacherFormValues }

export interface SubjectOption {
  id: string
  name: string
}

export interface TeachersViewProps {
  teachers: Teacher[]
  subjects: SubjectOption[]
  onSubmitTeacher: (payload: TeacherMutationPayload) => void | Promise<void>
  assignedTeacherIds: string[]
  onAssignTeacher: (teacher: Teacher) => void | Promise<void>
  onUnassignTeacher: (teacher: Teacher) => void | Promise<void>
  assignmentPendingTeacherId?: string | null
}

const TeachersView = ({
  teachers,
  subjects,
  onSubmitTeacher,
  assignedTeacherIds,
  onAssignTeacher,
  onUnassignTeacher,
  assignmentPendingTeacherId = null,
}: TeachersViewProps) => {
  const [searchValue, setSearchValue] = React.useState("")
  const [assignmentFilter, setAssignmentFilter] = React.useState<
    "all" | "assigned" | "unassigned"
  >("all")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingTeacher, setEditingTeacher] = React.useState<Teacher | null>(null)
  const [assignTarget, setAssignTarget] = React.useState<Teacher | null>(null)
  const [unassignTarget, setUnassignTarget] = React.useState<Teacher | null>(null)

  const subjectNameById = React.useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject.name])),
    [subjects]
  )

  const form = useForm<TeacherFormInput, unknown, TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      subject_id: "",
      is_active: "true",
    },
  })

  const activeTeachers = React.useMemo(
    () => teachers.filter((teacher) => teacher.is_active),
    [teachers]
  )

  const assignedTeacherIdSet = React.useMemo(
    () => new Set(assignedTeacherIds),
    [assignedTeacherIds]
  )

  const filteredTeachers = React.useMemo(() => {
    const normalizedSearch = searchValue.toLowerCase().trim()
    const bySearch = !normalizedSearch
      ? teachers
      : teachers.filter(
          (teacher) =>
            teacher.name.toLowerCase().includes(normalizedSearch) ||
            teacher.mobile.toLowerCase().includes(normalizedSearch) ||
            (subjectNameById.get(teacher.subject_id) ?? "")
              .toLowerCase()
              .includes(normalizedSearch)
        )

    if (assignmentFilter === "all") {
      return bySearch
    }
    if (assignmentFilter === "assigned") {
      return bySearch.filter((teacher) => assignedTeacherIdSet.has(teacher.id))
    }
    return bySearch.filter((teacher) => !assignedTeacherIdSet.has(teacher.id))
  }, [teachers, searchValue, subjectNameById, assignmentFilter, assignedTeacherIdSet])

  const openCreateDialog = () => {
    setEditingTeacher(null)
    form.reset({
      name: "",
      mobile: "",
      subject_id: "",
      is_active: "true",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = React.useCallback(
    (teacher: Teacher) => {
      setEditingTeacher(teacher)
      form.reset({
        name: teacher.name,
        mobile: teacher.mobile,
        subject_id: teacher.subject_id,
        is_active: String(teacher.is_active) as "true" | "false",
      })
      setIsDialogOpen(true)
    },
    [form]
  )

  const onSubmit = async (data: TeacherFormValues) => {
    if (editingTeacher) {
      await onSubmitTeacher({ mode: "update", id: editingTeacher.id, data })
    } else {
      await onSubmitTeacher({ mode: "create", data })
    }

    setIsDialogOpen(false)
    setEditingTeacher(null)
    form.reset()
  }

  const handleConfirmAssign = async () => {
    if (!assignTarget) return
    await onAssignTeacher(assignTarget)
    setAssignTarget(null)
  }

  const handleConfirmUnassign = async () => {
    if (!unassignTarget) return
    await onUnassignTeacher(unassignTarget)
    setUnassignTarget(null)
  }

  const columns: ColumnDef<Teacher>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "mobile",
      header: "Mobile",
    },
    {
      id: "subject",
      header: "Subject",
      cell: ({ row }) => subjectNameById.get(row.original.subject_id) ?? "Unknown Subject",
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
        const teacher = row.original
        const isAssigned = assignedTeacherIdSet.has(teacher.id)
        const isPending = assignmentPendingTeacherId === teacher.id
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => openEditDialog(teacher)}
            >
              Edit
            </Button>
            <Button
              variant={isAssigned ? "outline" : "default"}
              size="sm"
              type="button"
              disabled={isPending}
              onClick={() => (isAssigned ? setUnassignTarget(teacher) : setAssignTarget(teacher))}
            >
              {isPending ? "Saving..." : isAssigned ? "Unassign" : "Assign"}
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredTeachers,
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
  }, [searchValue, assignmentFilter, table])

  return (
    <div className="space-y-6 px-1 py-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-foreground">{teachers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Active Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-foreground">{activeTeachers.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="py-0">
        <CardHeader className="flex flex-col gap-3 border-b py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 md:max-w-xl md:flex-row">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search teachers by name or mobile..."
                className="pl-9"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>
            <Select
              value={assignmentFilter}
              onValueChange={(value: "all" | "assigned" | "unassigned") =>
                setAssignmentFilter(value)
              }
            >
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Assignment filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All teachers</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={openCreateDialog}>
            Create Teacher
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
                    No teachers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          Showing {table.getRowModel().rows.length} of {filteredTeachers.length} filtered teachers
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
          setIsDialogOpen(open)
          if (!open) {
            setEditingTeacher(null)
            form.reset()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeacher ? "Edit Teacher" : "Create Teacher"}</DialogTitle>
            <DialogDescription>
              {editingTeacher
                ? "Update teacher information and save changes."
                : "Fill in teacher details to create a new record."}
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
                      <Input placeholder="Teacher name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input placeholder="+94771234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <FormLabel>Teacher Status</FormLabel>
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingTeacher ? "Update Teacher" : "Create Teacher"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(assignTarget)} onOpenChange={(open) => !open && setAssignTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign teacher</DialogTitle>
            <DialogDescription>
              Assign this teacher to the current institute?
            </DialogDescription>
          </DialogHeader>
          {assignTarget ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Teacher:</span> {assignTarget.name}
              </p>
              <p>
                <span className="text-muted-foreground">Mobile:</span> {assignTarget.mobile}
              </p>
              <p>
                <span className="text-muted-foreground">Subject:</span>{" "}
                {subjectNameById.get(assignTarget.subject_id) ?? "Unknown Subject"}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAssignTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={assignmentPendingTeacherId === assignTarget?.id}
              onClick={() => void handleConfirmAssign()}
            >
              {assignmentPendingTeacherId === assignTarget?.id ? "Assigning..." : "Confirm Assign"}
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
            <DialogTitle>Unassign teacher</DialogTitle>
            <DialogDescription>
              This removes the teacher from this institute assignment.
            </DialogDescription>
          </DialogHeader>
          {unassignTarget ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Teacher:</span> {unassignTarget.name}
              </p>
              <p>
                <span className="text-muted-foreground">Mobile:</span> {unassignTarget.mobile}
              </p>
              <p>
                <span className="text-muted-foreground">Subject:</span>{" "}
                {subjectNameById.get(unassignTarget.subject_id) ?? "Unknown Subject"}
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
              disabled={assignmentPendingTeacherId === unassignTarget?.id}
              onClick={() => void handleConfirmUnassign()}
            >
              {assignmentPendingTeacherId === unassignTarget?.id
                ? "Unassigning..."
                : "Confirm Unassign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TeachersView
