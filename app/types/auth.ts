import { BaseDomain } from "./common";

export interface Owner extends BaseDomain {
    name: string;
    mobile: string;
  }