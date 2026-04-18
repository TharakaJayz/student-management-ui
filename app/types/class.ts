import { BaseDomain, Days } from "./common";

export interface Class extends BaseDomain {
    name: string;
    class_room_id: string;
    institute_id: string;
    teacher_id: string;
    subject_id: string;
    grade: string;
    start_time: number;
    end_time: number;
    frequency: "WEEKLY" | "OTHER";
    day: Days;
    class_fee: number;
  }
