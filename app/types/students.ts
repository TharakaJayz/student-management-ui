import { BaseDomain } from "./common";

export interface Student extends BaseDomain {
    name: string;
    age: number;
    imageUrl: string;         
    grade: string;
  }