import { EventLite } from "@/data/events";
import { isTodayOrFuture, toGBDate } from "./date";

export const getUpcomingEvents = (events: EventLite[]): EventLite[] =>
  (events || [])
    .filter((e) => isTodayOrFuture(e.date))
    .sort(
      (a, b) =>
        new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
    );

export const makeEventOptions = (events: EventLite[]) =>
  (events || []).map((e) => ({
    key: e._id,
    value: `${e.location || "Unknown"} - ${toGBDate(e.date)}`,
  }));

export const findEvent = (events: EventLite[], id?: string | null) =>
  id ? events.find((e) => e._id === id) : undefined;
