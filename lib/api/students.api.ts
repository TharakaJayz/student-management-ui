import { Student } from "@/app/types/students";
import { getSupabaseBrowserClient } from "../supabase/client";
import { TableNames } from "../utils";


export async function getAllStudents(instituteId: string): Promise<any[]> {
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
        .eq("institute_id", "1ba78024-33fd-4f63-a3a6-1117c3c5ae30")
        .eq("is_active", true);

    console.log("student all data", data);
    if (data) {

        const students: any[] = data.map((singleData) => {
            return {
                ...singleData.student,
            }
        });

        console.log("mapped students", students)
    }

    if (error) throw error;
    return data;
}