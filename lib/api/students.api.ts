import type { Student } from "@/app/types/students";
import { getSupabaseBrowserClient } from "../supabase/client";


type StudentRow = {
  id: string;
  name: string;
  age: number;
  image_url: string;
  grade: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function normalizeStudentRelation(raw: unknown): StudentRow {
  const s = (Array.isArray(raw) ? raw[0] : raw) as StudentRow | undefined;
  if (!s) {
    throw new Error("Enrollment row missing student");
  }
  return s;
}

export async function getAllStudents(instituteId: string): Promise<Student[]> {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.from("student_institute_enrollments")
        .select(`
      student:students (
        id,
        name,
        age,
        image_url,
        grade,
        is_active,
        created_at,
        updated_at
      )
    `)
        .eq("institute_id", instituteId)
        .eq("is_active", true);

    console.log("student all data", data);
    if (error) throw error;
    if (!data?.length) return [];

    return data.map((row) => {
        const s = normalizeStudentRelation((row as { student: unknown }).student);
        return {
            id: s.id,
            name: s.name,
            age: s.age,
            image_url: s.image_url,
            grade: s.grade,
            is_active: s.is_active,
            created_at: new Date(s.created_at),
            updated_at: new Date(s.updated_at),
        };
    });
}
