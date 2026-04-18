export enum Days {
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY",
    SUNDAY = "SUNDAY",
  }
  
  export interface BaseDomain {
    id: string;
    isActive: boolean;
    created_at: Date;
    updated_at: Date;
  }