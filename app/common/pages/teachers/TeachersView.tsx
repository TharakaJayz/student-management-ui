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
  isActive: z.enum(["true", "false"]),
})

type TeacherFormInput = z.input<typeof teacherFormSchema>
export type TeacherFormValues = z.output<typeof teacherFormSchema>

export type TeacherMutationPayload =
  | { mode: "create"; data: TeacherFormValues }
  | { mode: "update"; id: string; data: TeacherFormValues }

export interface TeachersViewProps {
  teachers: Teacher[]
  onSubmitTeacher: (payload: TeacherMutationPayload) => void
}

const TeachersView = ({ teachers, onSubmitTeacher }: TeachersViewProps) => {
  const [searchValue, setSearchValue] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingTeacher, setEditingTeacher] = React.useState<Teacher | null>(null)

  const form = useForm<TeacherFormInput, unknown, TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      isActive: "true",
    },
  })

  const activeTeachers = React.useMemo(
    () => teachers.filter((teacher) => teacher.isActive),
    [teachers]
  )

  const filteredTeachers = React.useMemo(() => {
    const normalizedSearch = searchValue.toLowerCase().trim()
    if (!normalizedSearch) return teachers

    return teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(normalizedSearch) ||
        teacher.mobile.toLowerCase().includes(normalizedSearch)
    )
  }, [teachers, searchValue])

  const openCreateDialog = () => {
    setEditingTeacher(null)
    form.reset({
      name: "",
      mobile: "",
      isActive: "true",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = React.useCallback(
    (teacher: Teacher) => {
      setEditingTeacher(teacher)
      form.reset({
        name: teacher.name,
        mobile: teacher.mobile,
        isActive: String(teacher.isActive) as "true" | "false",
      })
      setIsDialogOpen(true)
    },
    [form]
  )

  const onSubmit = (data: TeacherFormValues) => {
    if (editingTeacher) {
      onSubmitTeacher({ mode: "update", id: editingTeacher.id, data })
    } else {
      onSubmitTeacher({ mode: "create", data })
    }

    setIsDialogOpen(false)
    setEditingTeacher(null)
    form.reset()
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
      id: "status",
      header: "Status",
      cell: ({ row }) => (row.original.isActive ? "Active" : "Inactive"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => openEditDialog(row.original)}
        >
          Edit
        </Button>
      ),
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
  }, [searchValue, table])

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
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search teachers by name or mobile..."
              className="pl-9"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
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
                name="isActive"
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
    </div>
  )
}

export default TeachersView
