"use client"

import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { ClassRoom, Institute, Subject } from "@/app/types/institute"
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

const instituteSchema = z.object({
  name: z.string().min(2, "Institute name should be at least 2 characters"),
  address: z.string().min(5, "Address should be at least 5 characters"),
  owner_id: z.string().min(2, "Owner ID is required"),
})

const subjectSchema = z.object({
  name: z.string().min(2, "Subject name should be at least 2 characters"),
  medium: z.enum(["ENGLISH", "SINHALA"]),
})

const classRoomSchema = z.object({
  name: z.string().min(2, "Class name should be at least 2 characters"),
  location: z.string().min(2, "Location should be at least 2 characters"),
  capacity: z.number().int().min(1, "Capacity should be at least 1"),
  is_air_conditioned: z.enum(["true", "false"]),
})

type InstituteInput = z.input<typeof instituteSchema>
export type InstituteFormValues = z.output<typeof instituteSchema>

type SubjectInput = z.input<typeof subjectSchema>
export type SubjectFormValues = z.output<typeof subjectSchema>

type ClassRoomInput = z.input<typeof classRoomSchema>
export type ClassRoomFormValues = z.output<typeof classRoomSchema>

export type InstituteMutationPayload =
  | { mode: "create"; data: InstituteFormValues }
  | { mode: "update"; id: string; data: InstituteFormValues }

export type SubjectMutationPayload =
  | { mode: "create"; data: SubjectFormValues }
  | { mode: "update"; id: string; data: SubjectFormValues }

export type ClassRoomMutationPayload =
  | { mode: "create"; data: ClassRoomFormValues }
  | { mode: "update"; id: string; data: ClassRoomFormValues }

export interface InstituteSettingsViewProps {
  isNewUser: boolean
  institute: Institute | null
  subjects: Subject[]
  classRooms: ClassRoom[]
  onSubmitInstitute: (payload: InstituteMutationPayload) => void
  onSubmitSubject: (payload: SubjectMutationPayload) => void
  onSubmitClassRoom: (payload: ClassRoomMutationPayload) => void
}

const InstituteSettingsView = ({
  isNewUser,
  institute,
  subjects,
  classRooms,
  onSubmitInstitute,
  onSubmitSubject,
  onSubmitClassRoom,
}: InstituteSettingsViewProps) => {
  const [isInstituteDialogOpen, setIsInstituteDialogOpen] = React.useState(false)
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = React.useState(false)
  const [isClassRoomDialogOpen, setIsClassRoomDialogOpen] = React.useState(false)
  const [editingSubject, setEditingSubject] = React.useState<Subject | null>(null)
  const [editingClassRoom, setEditingClassRoom] = React.useState<ClassRoom | null>(null)

  const instituteForm = useForm<InstituteInput, unknown, InstituteFormValues>({
    resolver: zodResolver(instituteSchema),
    defaultValues: {
      name: "",
      address: "",
      owner_id: "",
    },
  })

  const subjectForm = useForm<SubjectInput, unknown, SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      medium: "ENGLISH",
    },
  })

  const classRoomForm = useForm<ClassRoomInput, unknown, ClassRoomFormValues>({
    resolver: zodResolver(classRoomSchema),
    defaultValues: {
      name: "",
      location: "",
      capacity: 30,
      is_air_conditioned: "false",
    },
  })

  const openCreateInstituteDialog = () => {
    instituteForm.reset({
      name: "",
      address: "",
      owner_id: "",
    })
    setIsInstituteDialogOpen(true)
  }

  const openEditInstituteDialog = () => {
    if (!institute) return
    instituteForm.reset({
      name: institute.name,
      address: institute.address,
      owner_id: institute.owner_id,
    })
    setIsInstituteDialogOpen(true)
  }

  const openCreateSubjectDialog = () => {
    setEditingSubject(null)
    subjectForm.reset({
      name: "",
      medium: "ENGLISH",
    })
    setIsSubjectDialogOpen(true)
  }

  const openEditSubjectDialog = (subject: Subject) => {
    setEditingSubject(subject)
    subjectForm.reset({
      name: subject.name,
      medium: subject.medium,
    })
    setIsSubjectDialogOpen(true)
  }

  const openCreateClassRoomDialog = () => {
    setEditingClassRoom(null)
    classRoomForm.reset({
      name: "",
      location: "",
      capacity: 30,
      is_air_conditioned: "false",
    })
    setIsClassRoomDialogOpen(true)
  }

  const openEditClassRoomDialog = (classRoom: ClassRoom) => {
    setEditingClassRoom(classRoom)
    classRoomForm.reset({
      name: classRoom.name,
      location: classRoom.location,
      capacity: classRoom.capacity,
      is_air_conditioned: String(classRoom.is_air_conditioned) as "true" | "false",
    })
    setIsClassRoomDialogOpen(true)
  }

  const handleInstituteSubmit = (data: InstituteFormValues) => {
    if (institute) {
      onSubmitInstitute({ mode: "update", id: institute.id, data })
    } else {
      onSubmitInstitute({ mode: "create", data })
    }
    setIsInstituteDialogOpen(false)
  }

  const handleSubjectSubmit = (data: SubjectFormValues) => {
    if (editingSubject) {
      onSubmitSubject({ mode: "update", id: editingSubject.id, data })
    } else {
      onSubmitSubject({ mode: "create", data })
    }

    setEditingSubject(null)
    setIsSubjectDialogOpen(false)
    subjectForm.reset()
  }

  const handleClassRoomSubmit = (data: ClassRoomFormValues) => {
    if (editingClassRoom) {
      onSubmitClassRoom({ mode: "update", id: editingClassRoom.id, data })
    } else {
      onSubmitClassRoom({ mode: "create", data })
    }

    setEditingClassRoom(null)
    setIsClassRoomDialogOpen(false)
    classRoomForm.reset()
  }

  return (
    <div className="space-y-6 px-1 py-2">
      {isNewUser ? (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Register Your Institute</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              First, create your institute. After that, you can manage classrooms and subjects.
            </p>
            <Button type="button" onClick={openCreateInstituteDialog}>
              Create Institute
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground">Institute</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">
                  {institute?.name ?? "Not set"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground">Total Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{subjects.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground">Total Class Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{classRooms.length}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle>Institute Profile</CardTitle>
              <Button type="button" onClick={openEditInstituteDialog}>
                Update Institute
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{institute?.name ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Owner ID</p>
                <p className="font-medium">{institute?.owner_id ?? "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{institute?.address ?? "-"}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card className="py-0">
              <CardHeader className="flex flex-col gap-3 border-b py-4 md:flex-row md:items-center md:justify-between">
                <CardTitle>Subjects</CardTitle>
                <Button type="button" onClick={openCreateSubjectDialog}>
                  Create Subject
                </Button>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Medium</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.length ? (
                      subjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell>{subject.name}</TableCell>
                          <TableCell>{subject.medium}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openEditSubjectDialog(subject)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                          No subjects created yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="py-0">
              <CardHeader className="flex flex-col gap-3 border-b py-4 md:flex-row md:items-center md:justify-between">
                <CardTitle>Class Rooms</CardTitle>
                <Button type="button" onClick={openCreateClassRoomDialog}>
                  Create Class Room
                </Button>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>AC</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classRooms.length ? (
                      classRooms.map((classRoom) => (
                        <TableRow key={classRoom.id}>
                          <TableCell>{classRoom.name}</TableCell>
                          <TableCell>{classRoom.location}</TableCell>
                          <TableCell>{classRoom.capacity}</TableCell>
                          <TableCell>{classRoom.is_air_conditioned ? "Yes" : "No"}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openEditClassRoomDialog(classRoom)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                          No class rooms created yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Dialog
        open={isInstituteDialogOpen}
        onOpenChange={(open) => {
          setIsInstituteDialogOpen(open)
          if (!open && !institute) {
            instituteForm.reset({
              name: "",
              address: "",
              owner_id: "",
            })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{institute ? "Update Institute" : "Create Institute"}</DialogTitle>
            <DialogDescription>
              {institute
                ? "Update your institute information."
                : "Create your institute to continue with class rooms and subjects."}
            </DialogDescription>
          </DialogHeader>

          <Form {...instituteForm}>
            <form className="space-y-4" onSubmit={instituteForm.handleSubmit(handleInstituteSubmit)}>
              <FormField
                control={instituteForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institute Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Alpha Institute" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={instituteForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="No 12, Main Road, Colombo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={instituteForm.control}
                name="owner_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner ID</FormLabel>
                    <FormControl>
                      <Input placeholder="owner-123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsInstituteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{institute ? "Update Institute" : "Create Institute"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSubjectDialogOpen}
        onOpenChange={(open) => {
          setIsSubjectDialogOpen(open)
          if (!open) {
            setEditingSubject(null)
            subjectForm.reset()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubject ? "Update Subject" : "Create Subject"}</DialogTitle>
            <DialogDescription>
              {editingSubject ? "Update selected subject." : "Create a subject for this institute."}
            </DialogDescription>
          </DialogHeader>

          <Form {...subjectForm}>
            <form className="space-y-4" onSubmit={subjectForm.handleSubmit(handleSubjectSubmit)}>
              <FormField
                control={subjectForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Mathematics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={subjectForm.control}
                name="medium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medium</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select medium" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ENGLISH">ENGLISH</SelectItem>
                          <SelectItem value="SINHALA">SINHALA</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingSubject ? "Update Subject" : "Create Subject"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isClassRoomDialogOpen}
        onOpenChange={(open) => {
          setIsClassRoomDialogOpen(open)
          if (!open) {
            setEditingClassRoom(null)
            classRoomForm.reset()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClassRoom ? "Update Class Room" : "Create Class Room"}</DialogTitle>
            <DialogDescription>
              {editingClassRoom ? "Update selected class room." : "Create a class room for this institute."}
            </DialogDescription>
          </DialogHeader>

          <Form {...classRoomForm}>
            <form className="space-y-4" onSubmit={classRoomForm.handleSubmit(handleClassRoomSubmit)}>
              <FormField
                control={classRoomForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Grade 7 - A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={classRoomForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Second Floor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={classRoomForm.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="30"
                          value={field.value}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={classRoomForm.control}
                name="is_air_conditioned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Air Conditioned</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsClassRoomDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingClassRoom ? "Update Class Room" : "Create Class Room"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InstituteSettingsView
