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

import type { Class } from "@/app/types/class"
import { Days } from "@/app/types/common"
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
  gradeOptions,
  onSubmitClass,
}: ClassesViewProps) => {
  const [searchValue, setSearchValue] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isClassSaving, setIsClassSaving] = React.useState(false)
  const [editingClass, setEditingClass] = React.useState<Class | null>(null)

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
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(row.original)}>
          Edit
        </Button>
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
