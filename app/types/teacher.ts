import { BaseDomain } from "./common";

export interface Teacher extends BaseDomain {
    name: string;
    mobile: string;
    subject_id: string;
  }

  export interface Teacher_institute_assignments {
    teacher_id: string;
    institute_id: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }