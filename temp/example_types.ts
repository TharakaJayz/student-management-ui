import { Days } from "@/app/types/common";


interface BaseDomain {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// interface Institute extends BaseDomain {
//   name: string;
//   address: string;
//   ownerId: string;
// }

// interface Student extends BaseDomain {
//   name: string;
//   age: number;
//   imageUrl: string;         
//   grade: string;
// }

// interface Owner extends BaseDomain {
//   name: string;
//   mobile: string;
// }

// interface Teacher extends BaseDomain {
//   name: string;
//   mobile: string;
//   subjectId:string;
// }

// interface ClassRoom extends BaseDomain {
//   name: string;
//   instituteId: string;
//   location: string;
//   capacity: number;
//   isAirConditioned: boolean;
// }

// interface Subject extends BaseDomain {
//   name: string;
//   medium:"ENGLISH" | "SINHALA"
// }

interface Teacher_Subject {
  teacherId: string;
  subjectId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// interface Class extends BaseDomain {
//   name: string;
//   classRoomId: string;
//   instituteId: string;
//   teacherId: string;
//   subjectId: string;
//   grade: string;
//   startTime: number;
//   endTime: number;
//   frequency: "WEEKLY" | "OTHER";
//   day: Days;
//   classFee: number;
// }

interface Student_Class {
  studentId: string; //fk
  classId: string; //fk
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Student_subject {
  studentId: string; //fk
  subjectId: string; //fk
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Student_class_attendances {
  studentId: string;
  classId: string;
  attendanceDate: number;
  isPresent: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Student_class_monthly_payments {
  billingMonth: string; 
  studentId: string;
  grade: string;
  classId: string;
  instituteId: string;
  amountDue: number;
  paymentAmount: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Teacher_class_monthly_payments {
    instituteId: string;
    teacherId: string;
    classId: string;
    billingMonth: string;
    amountDue: number;
    paymentAmount: number;
    paymentStatus: "PENDING" | "PAID" | "FAILED";
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// interface Student_institute_enrollments {
//   studentId: string;
//   instituteId: string;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface Teacher_institute_assignments {
//   teacherId: string;
//   instituteId: string;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }
