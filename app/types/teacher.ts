import { BaseDomain } from "./common";

export interface Teacher extends BaseDomain {
    name: string;
    mobile: string;
    subject_id: string;
  }
