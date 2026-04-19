"use client"

import React from "react"

import type { ClassRoom, Institute, Subject } from "@/app/types/institute"
import { PageLoading } from "@/components/page-loading"
import {
  createClassroom,
  createInstitute,
  getAllSubjects,
  getClassRoomsByInstituteId,
  getInstituteByOwnerId,
  getOwnerById,
  updateClassroom,
  updateInstitute,
  upsertOwnerProfile,
  upsertSubject,
} from "@/lib/api/institute-settings.api"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

import InstituteSettingsView, {
  type ClassRoomMutationPayload,
  type InstituteFormValues,
  type InstituteMutationPayload,
  type OwnerFormValues,
  type SubjectMutationPayload,
} from "./InstituteSettingsView"

const parseInstituteForm = (
  payload: InstituteFormValues
): Omit<Institute, "id" | "created_at" | "updated_at" | "is_active"> => ({
  name: payload.name,
  address: payload.address,
  owner_id: payload.owner_id,
})

function getInvokeErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as { message: unknown }).message === "string"
  ) {
    return (e as { message: string }).message
  }
  return "Could not create institute"
}

const InstituteSettingsContainer = () => {
  const [bootstrapStatus, setBootstrapStatus] = React.useState<
    "loading" | "ready" | "error"
  >("loading")
  const [bootstrapError, setBootstrapError] = React.useState<string | null>(null)

  const [isNewUser, setIsNewUser] = React.useState(false)
  const [newUserSetupStep, setNewUserSetupStep] = React.useState<
    "owner" | "institute"
  >("owner")
  const [authUserId, setAuthUserId] = React.useState<string | null>(null)
  const [institute, setInstitute] = React.useState<Institute | null>(null)
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [classRooms, setClassRooms] = React.useState<ClassRoom[]>([])
  const [ownerProfileSubmitting, setOwnerProfileSubmitting] = React.useState(false)
  const [ownerProfileError, setOwnerProfileError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    void (async () => {
      setBootstrapStatus("loading")
      setBootstrapError(null)

      const {
        data: { user },
      } = await getSupabaseBrowserClient().auth.getUser()

      if (cancelled) return

      if (!user?.id) {
        setAuthUserId(null)
        setInstitute(null)
        setSubjects([])
        setClassRooms([])
        setIsNewUser(false)
        setBootstrapStatus("ready")
        return
      }

      setAuthUserId(user.id)

      try {
        const owner = await getOwnerById(user.id)
        if (cancelled) return

        if (!owner) {
          setIsNewUser(true)
          setNewUserSetupStep("owner")
          setInstitute(null)
          setSubjects([])
          setClassRooms([])
          setBootstrapStatus("ready")
          return
        }

        const instituteRow = await getInstituteByOwnerId(user.id)
        if (cancelled) return

        if (!instituteRow) {
          setIsNewUser(true)
          setNewUserSetupStep("institute")
          setInstitute(null)
          setSubjects([])
          setClassRooms([])
          setBootstrapStatus("ready")
          return
        }

        setInstitute(instituteRow)
        setIsNewUser(false)

        try {
          const subjectRows = await getAllSubjects()
          if (cancelled) return
          setSubjects(subjectRows)
        } catch (subjectErr) {
          if (cancelled) return
          console.error(subjectErr)
          setSubjects([])
        }

        try {
          const classRoomRows = await getClassRoomsByInstituteId(instituteRow.id)
          if (cancelled) return
          setClassRooms(classRoomRows)
        } catch (classRoomErr) {
          if (cancelled) return
          console.error(classRoomErr)
          setClassRooms([])
        }

        setBootstrapStatus("ready")
      } catch (e) {
        if (cancelled) return
        const message =
          e instanceof Error ? e.message : "Could not load institute settings"
        setBootstrapError(message)
        setBootstrapStatus("error")
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmitOwnerProfile = React.useCallback(
    async (data: OwnerFormValues) => {
      if (!authUserId) {
        console.warn("Owner profile: no authenticated user id yet")
        return
      }

      setOwnerProfileError(null)
      setOwnerProfileSubmitting(true)
      try {
        await upsertOwnerProfile({
          name: data.name,
          mobile: data.mobile,
        })
        setNewUserSetupStep("institute")
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Could not save owner profile"
        setOwnerProfileError(message)
        console.error(e)
      } finally {
        setOwnerProfileSubmitting(false)
      }
    },
    [authUserId]
  )

  const handleSubmitInstitute = async (payload: InstituteMutationPayload) => {
    if (payload.mode === "create") {
      try {
        const { institute: created } = await createInstitute(
          payload.data.name,
          payload.data.address
        )
        setInstitute(created)
        setIsNewUser(false)
        toast.success("Institute created successfully")
      } catch (e) {
        const message = getInvokeErrorMessage(e)
        toast.error(message)
        throw e
      }
      return
    }

    try {
      const { institute: updated } = await updateInstitute(
        payload.id,
        payload.data.name,
        payload.data.address
      )
      setInstitute(updated)
      toast.success("Institute updated successfully")
    } catch (e) {
      const message = getInvokeErrorMessage(e)
      toast.error(message)
      throw e
    }
  }

  const handleSubmitSubject = async (payload: SubjectMutationPayload) => {
    if (!institute) {
      toast.error("Create your institute before adding subjects.")
      throw new Error("Missing institute")
    }

    try {
      const { subject } = await upsertSubject({
        instituteId: institute.id,
        subjectId: payload.mode === "update" ? payload.id : undefined,
        name: payload.data.name,
        medium: payload.data.medium,
        isActive: true,
      })

      if (payload.mode === "create") {
        setSubjects((previous) => [...previous, subject])
        toast.success("Subject created")
      } else {
        setSubjects((previous) =>
          previous.map((s) => (s.id === payload.id ? subject : s)),
        )
        toast.success("Subject updated")
      }
    } catch (e) {
      const message = getInvokeErrorMessage(e)
      toast.error(message)
      throw e
    }
  }

  const handleSubmitClassRoom = async (payload: ClassRoomMutationPayload) => {
    if (!institute) {
      toast.error("Create your institute before adding class rooms.")
      throw new Error("Missing institute")
    }

    const isAirConditioned = payload.data.is_air_conditioned === "true"

    try {
      if (payload.mode === "create") {
        const { classRoom } = await createClassroom({
          instituteId: institute.id,
          name: payload.data.name,
          location: payload.data.location,
          capacity: payload.data.capacity,
          isAirConditioned,
        })
        setClassRooms((previous) => [...previous, classRoom])
        toast.success("Class room created")
        return
      }

      const { classRoom } = await updateClassroom({
        classRoomId: payload.id,
        name: payload.data.name,
        location: payload.data.location,
        capacity: payload.data.capacity,
        isAirConditioned,
      })
      setClassRooms((previous) =>
        previous.map((room) => (room.id === payload.id ? classRoom : room)),
      )
      toast.success("Class room updated")
    } catch (e) {
      const message = getInvokeErrorMessage(e)
      toast.error(message)
      throw e
    }
  }

  if (bootstrapStatus === "loading") {
    return (
      <PageLoading
        title="Loading your workspace"
        description="Checking your owner profile and institute…"
      />
    )
  }

  if (bootstrapStatus === "error" && bootstrapError) {
    return (
      <div className="px-1 py-4">
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {bootstrapError}
        </div>
      </div>
    )
  }

  if (!authUserId) {
    return (
      <div className="flex min-h-[32vh] flex-col items-center justify-center gap-2 px-4 py-12 text-center">
        <p className="text-sm font-medium text-foreground">Sign in required</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Sign in to set up your institute and manage settings.
        </p>
      </div>
    )
  }

  return (
    <div>
      <InstituteSettingsView
        isNewUser={isNewUser}
        newUserSetupStep={newUserSetupStep}
        authUserId={authUserId}
        institute={institute}
        subjects={subjects}
        classRooms={classRooms}
        onSubmitOwnerProfile={handleSubmitOwnerProfile}
        ownerProfileSubmitting={ownerProfileSubmitting}
        ownerProfileError={ownerProfileError}
        onSubmitInstitute={handleSubmitInstitute}
        onSubmitSubject={handleSubmitSubject}
        onSubmitClassRoom={handleSubmitClassRoom}
      />
    </div>
  )
}

export default InstituteSettingsContainer
