import { Service } from "@/api/users";

export type Vendor = {
  _id: string;
  business_name: string;
  logo?: string;
  services?: Service[];
};
