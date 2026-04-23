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
import { toast } from "sonner"
import { z } from "zod"

import type { Class } from "@/app/types/class"
import type { Student } from "@/app/types/students"
import { Days } from "@/app/types/common"
import {
  createStudentClasses,
  deleteStudentClasses,
  getAllStudentClassesByClassId,
} from "@/lib/api/class.api"
import { getAllStudentsByGrade } from "@/lib/api/students.api"
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

const classSchema = z
  .object({
    name: z.string().min(2, "Class name should be at least 2 characters"),
    class_room_id: z.string().min(1, "Class room is required"),
    teacher_id: z.string().min(1, "Teacher is required"),
    subject_id: z.string().min(1, "Subject is required"),
    grade: z.string().min(1, "Grade is required"),
    start_time: z.number().min(0, "Start time should be between 0 and 23").max(23),
    end_time: z.number().min(0, "End time should be between 0 and 23").max(23),
    frequency: z.enum(["WEEKLY", "OTHER"]),
    day: z.nativeEnum(Days),
    class_fee: z.number().min(0, "Class fee cannot be negative"),
    is_active: z.enum(["true", "false"]),
  })
  .refine((values) => values.end_time > values.start_time, {
    message: "End time should be greater than start time",
    path: ["end_time"],
  })

type ClassInput = z.input<typeof classSchema>
export type ClassFormValues = z.output<typeof classSchema>

export interface EntityOption {
  id: string
  name: string
}

export type ClassMutationPayload =
  | { mode: "create"; data: ClassFormValues }
  | { mode: "update"; id: string; data: ClassFormValues }

export interface ClassesViewProps {
  classes: Class[]
  classRoomOptions: EntityOption[]
  teacherOptions: EntityOption[]
  subjectOptions: EntityOption[]
  studentCountByClassId: Record<string, number>
  gradeOptions: readonly string[]
  onSubmitClass: (payload: ClassMutationPayload) => void | Promise<void>
}

const dayOrder: Days[] = [
  Days.MONDAY,
  Days.TUESDAY,
  Days.WEDNESDAY,
  Days.THURSDAY,
  Days.FRIDAY,
  Days.SATURDAY,
  Days.SUNDAY,
]

const getCurrentDay = (): Days => {
  const dayIndex = new Date().getDay()
  const mappedDay = [Days.SUNDAY, Days.MONDAY, Days.TUESDAY, Days.WEDNESDAY, Days.THURSDAY, Days.FRIDAY, Days.SATURDAY]
  return mappedDay[dayIndex]
}

const formatHour = (hour: number) => `${String(hour).padStart(2, "0")}:00`

const ClassesView = ({
  classes,
  classRoomOptions,
  teacherOptions,
  subjectOptions,
  studentCountByClassId,
  gradeOptions,
  onSubmitClass,
}: ClassesViewProps) => {
  const [searchValue, setSearchValue] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isClassSaving, setIsClassSaving] = React.useState(false)
  const [editingClass, setEditingClass] = React.useState<Class | null>(null)
  const [isConfigDialogOpen, setIsConfigDialogOpen] = React.useState(false)
  const [configClass, setConfigClass] = React.useState<Class | null>(null)
  const [studentsByGrade, setStudentsByGrade] = React.useState<Student[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<Set<string>>(new Set())
  const [initialStudentIds, setInitialStudentIds] = React.useState<Set<string>>(new Set())
  const [studentsSearchValue, setStudentsSearchValue] = React.useState("")
  const [isConfigLoading, setIsConfigLoading] = React.useState(false)
  const [isConfigSaving, setIsConfigSaving] = React.useState(false)
  const [configStudentImageErrors, setConfigStudentImageErrors] = React.useState<Record<string, boolean>>({})

  const classRoomNameById = React.useMemo(
    () => new Map(classRoomOptions.map((option) => [option.id, option.name])),
    [classRoomOptions]
  )
  const teacherNameById = React.useMemo(
    () => new Map(teacherOptions.map((option) => [option.id, option.name])),
    [teacherOptions]
  )
  const subjectNameById = React.useMemo(
    () => new Map(subjectOptions.map((option) => [option.id, option.name])),
    [subjectOptions]
  )

  const form = useForm<ClassInput, unknown, ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      class_room_id: "",
      teacher_id: "",
      subject_id: "",
      grade: "",
      start_time: 8,
      end_time: 10,
      frequency: "WEEKLY",
      day: Days.MONDAY,
      class_fee: 0,
      is_active: "true",
    },
  })

  const today = getCurrentDay()

  const todaysClasses = React.useMemo(
    () => classes.filter((item) => item.day === today && item.is_active),
    [classes, today]
  )

  const todaysRevenue = React.useMemo(
    () => todaysClasses.reduce((total, item) => total + item.class_fee, 0),
    [todaysClasses]
  )

  const filteredClasses = React.useMemo(() => {
    const normalizedSearch = searchValue.toLowerCase().trim()
    if (!normalizedSearch) return classes

    return classes.filter((item) => {
      return (
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.grade.toLowerCase().includes(normalizedSearch) ||
        (teacherNameById.get(item.teacher_id) ?? "").toLowerCase().includes(normalizedSearch) ||
        (subjectNameById.get(item.subject_id) ?? "").toLowerCase().includes(normalizedSearch)
      )
    })
  }, [classes, searchValue, teacherNameById, subjectNameById])

  const openCreateDialog = () => {
    setEditingClass(null)
    form.reset({
      name: "",
      class_room_id: "",
      teacher_id: "",
      subject_id: "",
      grade: "",
      start_time: 8,
      end_time: 10,
      frequency: "WEEKLY",
      day: Days.MONDAY,
      class_fee: 0,
      is_active: "true",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = React.useCallback(
    (item: Class) => {
      setEditingClass(item)
      form.reset({
        name: item.name,
        class_room_id: item.class_room_id,
        teacher_id: item.teacher_id,
        subject_id: item.subject_id,
        grade: item.grade,
        start_time: item.start_time,
        end_time: item.end_time,
        frequency: item.frequency,
        day: item.day,
        class_fee: item.class_fee,
        is_active: String(item.is_active) as "true" | "false",
      })
      setIsDialogOpen(true)
    },
    [form]
  )

  const onSubmit = async (data: ClassFormValues) => {
    setIsClassSaving(true)
    try {
      if (editingClass) {
        await onSubmitClass({ mode: "update", id: editingClass.id, data })
      } else {
        await onSubmitClass({ mode: "create", data })
      }

      setEditingClass(null)
      setIsDialogOpen(false)
      form.reset()
    } finally {
      setIsClassSaving(false)
    }
  }

  const openConfigDialog = React.useCallback(async (item: Class) => {
    setConfigClass(item)
    setIsConfigDialogOpen(true)
    setStudentsSearchValue("")
    setIsConfigLoading(true)
    try {
      const [gradeStudents, assignedStudents] = await Promise.all([
        getAllStudentsByGrade(item.grade),
        getAllStudentClassesByClassId(item.id),
      ])
      const activeAssignedIds = new Set(assignedStudents.map((row) => row.student_id))
      setStudentsByGrade(gradeStudents)
      setInitialStudentIds(activeAssignedIds)
      setSelectedStudentIds(new Set(activeAssignedIds))
    } catch (error) {
      console.error("Failed to load class student configuration", error)
      toast.error("Could not load students for this class")
    } finally {
      setIsConfigLoading(false)
    }
  }, [])

  const filteredStudents = React.useMemo(() => {
    const normalizedSearch = studentsSearchValue.toLowerCase().trim()
    if (!normalizedSearch) return studentsByGrade

    return studentsByGrade.filter((student) => student.name.toLowerCase().includes(normalizedSearch))
  }, [studentsByGrade, studentsSearchValue])

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((previous) => {
      const next = new Set(previous)
      if (next.has(studentId)) {
        next.delete(studentId)
      } else {
        next.add(studentId)
      }
      return next
    })
  }

  const handleSaveConfiguredStudents = async () => {
    if (!configClass) return

    const toAssign = Array.from(selectedStudentIds).filter((studentId) => !initialStudentIds.has(studentId))
    const toUnassign = Array.from(initialStudentIds).filter((studentId) => !selectedStudentIds.has(studentId))

    setIsConfigSaving(true)
    try {
      await Promise.all([
        toAssign.length
          ? createStudentClasses(toAssign.map((studentId) => ({ studentId, classId: configClass.id })))
          : Promise.resolve([]),
        toUnassign.length
          ? deleteStudentClasses(toUnassign.map((studentId) => ({ studentId, classId: configClass.id })))
          : Promise.resolve([]),
      ])
      setInitialStudentIds(new Set(selectedStudentIds))
      toast.success("Class student configuration saved")
    } catch (error) {
      console.error("Failed to save class student configuration", error)
      toast.error("Could not save class student configuration")
    } finally {
      setIsConfigSaving(false)
    }
  }

  const hasConfigChanges = React.useMemo(() => {
    if (selectedStudentIds.size !== initialStudentIds.size) return true
    for (const studentId of selectedStudentIds) {
      if (!initialStudentIds.has(studentId)) return true
    }
    return false
  }, [initialStudentIds, selectedStudentIds])

  const columns: ColumnDef<Class>[] = [
    {
      accessorKey: "name",
      header: "Class",
    },
    {
      accessorKey: "grade",
      header: "Grade",
    },
    {
      id: "subject",
      header: "Subject",
      cell: ({ row }) => subjectNameById.get(row.original.subject_id) ?? "Unknown",
    },
    {
      id: "teacher",
      header: "Teacher",
      cell: ({ row }) => teacherNameById.get(row.original.teacher_id) ?? "Unknown",
    },
    {
      accessorKey: "day",
      header: "Day",
    },
    {
      id: "time",
      header: "Time",
      cell: ({ row }) => `${formatHour(row.original.start_time)} - ${formatHour(row.original.end_time)}`,
    },
    {
      id: "students",
      header: "Students",
      cell: ({ row }) => studentCountByClassId[row.original.id] ?? 0,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(row.original)}>
            Edit
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => void openConfigDialog(row.original)}>
            Config
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: filteredClasses,
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
  }, [searchValue, table])

  return (
    <div className="space-y-6 px-1 py-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Classes Today ({today})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{todaysClasses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Today Expected Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">LKR {todaysRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Total Active Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{classes.filter((item) => item.is_active).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="py-0">
        <CardHeader className="flex flex-col gap-3 border-b py-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search classes by name, grade, teacher or subject..."
              className="pl-9"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>
          <Button type="button" onClick={openCreateDialog}>
            Create Class
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
                  <TableCell colSpan={columns.length} className="h-20 text-center text-muted-foreground">
                    No classes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          Showing {table.getRowModel().rows.length} of {filteredClasses.length} filtered classes
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
        open={isConfigDialogOpen}
        onOpenChange={(open) => {
          if (!open && (isConfigLoading || isConfigSaving)) return
          setIsConfigDialogOpen(open)
          if (!open) {
            setConfigClass(null)
            setStudentsByGrade([])
            setSelectedStudentIds(new Set())
            setInitialStudentIds(new Set())
            setStudentsSearchValue("")
            setConfigStudentImageErrors({})
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Students</DialogTitle>
            <DialogDescription>
              {configClass
                ? `Manage student assignments for ${configClass.name} (${configClass.grade}).`
                : "Manage student assignments for the selected class."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={studentsSearchValue}
                onChange={(event) => setStudentsSearchValue(event.target.value)}
                placeholder="Search students by name..."
                className="pl-9"
                disabled={isConfigLoading || isConfigSaving}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Select</TableHead>
                    <TableHead className="w-20">Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isConfigLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                        Loading students...
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.length ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer rounded border"
                            checked={selectedStudentIds.has(student.id)}
                            onChange={() => toggleStudentSelection(student.id)}
                            disabled={isConfigSaving}
                          />
                        </TableCell>
                        <TableCell>
                          {student.image_url && !configStudentImageErrors[student.id] ? (
                            <img
                              src={student.image_url}
                              alt={`${student.name} photo`}
                              className="h-9 w-9 rounded-full border object-cover"
                              onError={() =>
                                setConfigStudentImageErrors((previous) => ({
                                  ...previous,
                                  [student.id]: true,
                                }))
                              }
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                              {student.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                        No students found for this class grade.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <p className="text-sm text-muted-foreground">
              Selected {selectedStudentIds.size} of {studentsByGrade.length} students
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfigDialogOpen(false)}
              disabled={isConfigLoading || isConfigSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSaveConfiguredStudents()}
              disabled={isConfigLoading || isConfigSaving || !hasConfigChanges}
            >
              {isConfigSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open && isClassSaving) return
          setIsDialogOpen(open)
          if (!open) {
            setEditingClass(null)
            form.reset()
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClass ? "Update Class" : "Create Class"}</DialogTitle>
            <DialogDescription>
              {editingClass
                ? "Update class details and save changes."
                : "Fill class details and create a new class record."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Grade 8 Mathematics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                            {gradeOptions.map((grade) => (
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
                <FormField
                  control={form.control}
                  name="class_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Fee (LKR)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="3500"
                          value={field.value}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="class_room_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Room</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class room" />
                          </SelectTrigger>
                          <SelectContent>
                            {classRoomOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.name}
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
                  name="teacher_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                          <SelectContent position="popper" side="bottom" align="start">
                            {teacherOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.name}
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
                            {subjectOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.name}
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            {dayOrder.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
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
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WEEKLY">WEEKLY</SelectItem>
                            <SelectItem value="OTHER">OTHER</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time (Hour)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={23}
                          placeholder="8"
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
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time (Hour)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={23}
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
                  name="is_active"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
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
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isClassSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isClassSaving}>
                  {editingClass
                    ? isClassSaving
                      ? "Updating..."
                      : "Update Class"
                    : isClassSaving
                      ? "Creating..."
                      : "Create Class"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ClassesView
