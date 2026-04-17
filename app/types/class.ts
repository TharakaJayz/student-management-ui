import { BaseDomain, Days } from "./common";

export interface Class extends BaseDomain {
    name: string;
    classRoomId: string;
    instituteId: string;
    teacherId: string;
    subjectId: string;
    grade: string;
    startTime: number;
    endTime: number;
    frequency: "WEEKLY" | "OTHER";
    day: Days;
    classFee: number;
  }