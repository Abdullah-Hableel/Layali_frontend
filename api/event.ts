import { Event } from "@/data/events";
import instance, { baseURL } from "./index";
import { getToken } from "./storage";

export const createEvent = async (eventData: {
  budget: number;
  date: string;
  location: string;
}) => {
  const token = await getToken();
  console.log(token);
  const res = await instance.post(`${baseURL}/api/event`, eventData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.event;
};

export const getEventById = async (id: string) => {
  const res = await instance.get(`${baseURL}/api/event/${id}`);
  return res.data.event;
};

export const updateEvent = async (id: string, updateData: any) => {
  const res = await instance.put(`${baseURL}/api/event/${id}`, updateData);
  return res.data.event;
};

export const deleteEvent = async (id: string) => {
  const res = await instance.delete(`${baseURL}/api/event/${id}`);
  return res.data;
};

export const getAllEvents = async () => {
  const res = await instance.get(`${baseURL}/api/event`);
  return res.data.events;
};

export const getMyEvents = async () => {
  const token = await getToken();
  console.log(token);
  const res = await instance.get("/api/event/mine", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(res.data.events as Event[]);
  return res.data.events as Event[];
};
