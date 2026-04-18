import { BaseDomain } from "./common";

export interface Student extends BaseDomain {
    name: string;
    age: number;
    image_url: string;         
    grade: string;
  }

  
