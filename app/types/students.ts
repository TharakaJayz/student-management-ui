import { BaseDomain } from "./common";

export interface Student extends BaseDomain {
  name: string;
  age: number;
  image_url: string;
  grade: string;
}

export interface Student_institute_enrollments {
  student_id: string;
  institute_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Student_subject {
  student_id: string; 
  subject_id: string; 
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
