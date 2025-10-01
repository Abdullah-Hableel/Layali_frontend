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
