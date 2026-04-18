"use client"

import React from "react"

import type { ClassRoom, Institute, Subject } from "@/app/types/institute"
import type { Owner } from "@/app/types/owner"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

import InstituteSettingsView, {
  type ClassRoomFormValues,
  type ClassRoomMutationPayload,
  type InstituteFormValues,
  type InstituteMutationPayload,
  type OwnerFormValues,
  type SubjectFormValues,
  type SubjectMutationPayload,
} from "./InstituteSettingsView"

const initialIsNewUser = true

const parseInstituteForm = (
  payload: InstituteFormValues
): Omit<Institute, "id" | "created_at" | "updated_at" | "is_active"> => ({
  name: payload.name,
  address: payload.address,
  owner_id: payload.owner_id,
})

const parseSubjectForm = (
  payload: SubjectFormValues
): Omit<Subject, "id" | "created_at" | "updated_at" | "is_active"> => ({
  name: payload.name,
  medium: payload.medium,
})

const parseClassRoomForm = (
  payload: ClassRoomFormValues,
  institute_id: string
): Omit<ClassRoom, "id" | "created_at" | "updated_at" | "is_active"> => ({
  name: payload.name,
  institute_id,
  location: payload.location,
  capacity: payload.capacity,
  is_air_conditioned: payload.is_air_conditioned === "true",
})

const InstituteSettingsContainer = () => {
  const [isNewUser, setIsNewUser] = React.useState(initialIsNewUser)
  const [newUserSetupStep, setNewUserSetupStep] = React.useState<
    "owner" | "institute"
  >("owner")
  const [authUserId, setAuthUserId] = React.useState<string | null>(null)
  const [institute, setInstitute] = React.useState<Institute | null>(null)
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [classRooms, setClassRooms] = React.useState<ClassRoom[]>([])

  React.useEffect(() => {
    let cancelled = false
    void getSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!cancelled && user?.id) {
          setAuthUserId(user.id)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmitOwnerProfile = React.useCallback(
    (data: OwnerFormValues) => {
      if (!authUserId) {
        console.warn("Owner profile: no authenticated user id yet")
        return
      }

      const now = new Date()
      const owner: Owner = {
        id: authUserId,
        name: data.name,
        mobile: data.mobile,
        is_active: true,
        created_at: now,
        updated_at: now,
      }

      console.log("Owner profile (pending edge function)", owner)
      setNewUserSetupStep("institute")
    },
    [authUserId]
  )

  const handleSubmitInstitute = (payload: InstituteMutationPayload) => {
    if (payload.mode === "create") {
      const parsedInstitute = parseInstituteForm(payload.data)
      const now = new Date()

      const createdInstitute: Institute = {
        id: `ins-${crypto.randomUUID()}`,
        ...parsedInstitute,
        is_active: true,
        created_at: now,
        updated_at: now,
      }

      setInstitute(createdInstitute)
      setIsNewUser(false)
      return
    }

    setInstitute((previous) => {
      if (!previous || previous.id !== payload.id) {
        return previous
      }

      return {
        ...previous,
        ...parseInstituteForm(payload.data),
        updated_at: new Date(),
      }
    })
  }

  const handleSubmitSubject = (payload: SubjectMutationPayload) => {
    if (payload.mode === "create") {
      const parsedSubject = parseSubjectForm(payload.data)
      const now = new Date()

      setSubjects((previous) => [
        ...previous,
        {
          id: `sub-${crypto.randomUUID()}`,
          ...parsedSubject,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      ])
      return
    }

    setSubjects((previous) =>
      previous.map((subject) => {
        if (subject.id !== payload.id) {
          return subject
        }

        return {
          ...subject,
          ...parseSubjectForm(payload.data),
          updated_at: new Date(),
        }
      })
    )
  }

  const handleSubmitClassRoom = (payload: ClassRoomMutationPayload) => {
    if (!institute) return

    if (payload.mode === "create") {
      const parsedClassRoom = parseClassRoomForm(payload.data, institute.id)
      const now = new Date()

      setClassRooms((previous) => [
        ...previous,
        {
          id: `class-${crypto.randomUUID()}`,
          ...parsedClassRoom,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      ])
      return
    }

    setClassRooms((previous) =>
      previous.map((classRoom) => {
        if (classRoom.id !== payload.id) {
          return classRoom
        }

        return {
          ...classRoom,
          ...parseClassRoomForm(payload.data, institute.id),
          updated_at: new Date(),
        }
      })
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
        onSubmitInstitute={handleSubmitInstitute}
        onSubmitSubject={handleSubmitSubject}
        onSubmitClassRoom={handleSubmitClassRoom}
      />
    </div>
  )
}

export default InstituteSettingsContainer
