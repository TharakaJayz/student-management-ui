import { BaseDomain } from "./common";

export interface Institute extends BaseDomain {
    name: string;
    address: string;
    ownerId: string;
  }


  export interface ClassRoom extends BaseDomain {
    name: string;
    instituteId: string;
    location: string;
    capacity: number;
    isAirConditioned: boolean;
  }
  
  export interface Subject extends BaseDomain {
    name: string;
    medium:"ENGLISH" | "SINHALA"
  }