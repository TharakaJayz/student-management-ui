import type { ClassRoom, Institute, Subject } from "@/app/types/institute"
import type { Owner } from "@/app/types/owner"
import { getSupabaseBrowserClient } from "../supabase/client"
import type { DbRow } from "./db-row"

type UpsertOwnerProfileInput = {
  name: string
  mobile: string
}

type UpsertOwnerProfileResult = {
  owner: DbRow<Owner>
}

function mapOwnerRow(row: DbRow<Owner>): Owner {
  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }
}

function mapInstituteRow(row: DbRow<Institute>): Institute {
  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }
}

function mapSubjectRow(row: DbRow<Subject>): Subject {
  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }
}

function mapClassRoomRow(row: DbRow<ClassRoom>): ClassRoom {
  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }
}

export async function getOwnerById(ownerId: string): Promise<Owner | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("owners")
    .select(
      `
      id,
      name,
      mobile,
      is_active,
      created_at,
      updated_at
    `
    )
    .eq("id", ownerId)
    .eq("is_active", true)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapOwnerRow(data as DbRow<Owner>)
}

export async function upsertOwnerProfile(
  input: UpsertOwnerProfileInput,
): Promise<UpsertOwnerProfileResult> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke<UpsertOwnerProfileResult>(
    "upsert-owner-profile",
    { body: input },
  )

  if (error) throw error
  if (!data) throw new Error("Empty response from upsert-owner-profile")

  return data
}

export async function getInstituteByOwnerId(ownerId: string): Promise<Institute | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("institutes")
    .select(
      `
      id,
      name,
      address,
      owner_id,
      is_active,
      created_at,
      updated_at
    `
    )
    .eq("owner_id", ownerId)
    .eq("is_active", true)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapInstituteRow(data as DbRow<Institute>)
}

export async function getAllSubjects(): Promise<Subject[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("subjects")
    .select(
      `
      id,
      name,
      medium,
      is_active,
      created_at,
      updated_at
    `
    )
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) throw error
  if (!data?.length) return []
  return data.map((row) => mapSubjectRow(row as DbRow<Subject>))
}


export async function getClassRoomsByInstituteId(
  instituteId: string,
): Promise<ClassRoom[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("class_rooms")
    .select(
      `
      id,
      name,
      institute_id,
      location,
      capacity,
      is_air_conditioned,
      is_active,
      created_at,
      updated_at
    `
    )
    .eq("institute_id", instituteId)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) throw error
  if (!data?.length) return []

  return data.map((row) => mapClassRoomRow(row as DbRow<ClassRoom>))
}


export async function createInstitute(
  name: string,
  address: string,
): Promise<{ institute: Institute }> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke("create-institute", {
    body: { name, address },
  })
  if (error) {
    console.error(error)
    throw error
  }
  if (!data || typeof data !== "object" || !("institute" in data)) {
    throw new Error("Invalid response from create-institute")
  }
  const row = (data as { institute: DbRow<Institute> }).institute
  return { institute: mapInstituteRow(row) }
}

export async function updateInstitute(
  instituteId: string,
  name: string,
  address: string,
): Promise<{ institute: Institute }> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke("update-institute", {
    body: { instituteId, name, address },
  })
  if (error) {
    console.error(error)
    throw error
  }
  if (!data || typeof data !== "object" || !("institute" in data)) {
    throw new Error("Invalid response from update-institute")
  }
  const row = (data as { institute: DbRow<Institute> }).institute
  return { institute: mapInstituteRow(row) }
}

// --- upsert-subject (single edge function for create + update) ---
export async function upsertSubject(params: {
  instituteId: string
  subjectId?: string
  name: string
  medium: "ENGLISH" | "SINHALA"
  isActive?: boolean
}): Promise<{ subject: Subject }> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke("upsert-subject", {
    body: {
      instituteId: params.instituteId,
      subjectId: params.subjectId,
      name: params.name,
      medium: params.medium,
      isActive: params.isActive ?? true,
    },
  })
  if (error) {
    console.error(error)
    throw error
  }
  if (!data || typeof data !== "object" || !("subject" in data)) {
    throw new Error("Invalid response from upsert-subject")
  }
  const row = (data as { subject: DbRow<Subject> }).subject
  return { subject: mapSubjectRow(row) }
}

// --- create-classroom ---
export async function createClassroom(params: {
  instituteId: string
  name: string
  location: string
  capacity: number
  isAirConditioned: boolean
}): Promise<{ classRoom: ClassRoom }> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke("create-classroom", {
    body: params,
  })
  if (error) {
    console.error(error)
    throw error
  }
  if (!data || typeof data !== "object" || !("classRoom" in data)) {
    throw new Error("Invalid response from create-classroom")
  }
  const row = (data as { classRoom: DbRow<ClassRoom> }).classRoom
  return { classRoom: mapClassRoomRow(row) }
}

// --- update-classroom ---
export async function updateClassroom(params: {
  classRoomId: string
  name: string
  location: string
  capacity: number
  isAirConditioned: boolean
}): Promise<{ classRoom: ClassRoom }> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke("update-classroom", {
    body: params,
  })
  if (error) {
    console.error(error)
    throw error
  }
  if (!data || typeof data !== "object" || !("classRoom" in data)) {
    throw new Error("Invalid response from update-classroom")
  }
  const row = (data as { classRoom: DbRow<ClassRoom> }).classRoom
  return { classRoom: mapClassRoomRow(row) }
}
