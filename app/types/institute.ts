import { BaseDomain } from "./common";

export interface Institute extends BaseDomain {
    name: string;
    address: string;
    owner_id: string;
  }


  export interface ClassRoom extends BaseDomain {
    name: string;
    institute_id: string;
    location: string;
    capacity: number;
    is_air_conditioned: boolean;
  }
  
  export interface Subject extends BaseDomain {
    name: string;
    medium:"ENGLISH" | "SINHALA"
  }
