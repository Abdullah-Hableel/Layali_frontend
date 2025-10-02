import { Service } from "@/api/users";
import { User } from "./user";

export interface Event {
  _id: string;
  user: User["_id"];
  budget: number;
  date: string;
  location: string;
}

export type EventStats = {
  total: number;
  upcoming: number;
  old: number;
};

export type EventWithServiceCount = {
  _id: string;
  user: string;
  budget: number;
  date: Date;
  location: string;
  services: string[];
  invites: string[];
  servicesCount: number;
};

export type EventServices = {
  _id: string;
  servicesCount: number;
  services: Service[];
};
