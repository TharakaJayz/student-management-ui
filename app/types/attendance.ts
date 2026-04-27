export interface Student_class_attendances {
    student_id: string;
    class_id: string;
    attendance_date: number;
    is_present: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }

  export interface Student_class_monthly_payments {
    billing_month: string;
    student_id: string;
    grade: string;
    class_id: string;
    institute_id: string;
    amount_due: number;
    payment_amount: number;
    payment_status: "PENDING" | "PAID" | "FAILED";
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface Teacher_class_monthly_payments {
    institute_id: string;
    teacher_id: string;
    class_id: string;
    billing_month: string;
    amount_due: number;
    payment_amount: number;
    payment_status: "PENDING" | "PAID" | "FAILED";
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }