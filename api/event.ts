import instance, { baseURL } from "./index";

export const createEvent = async (eventData: {
  budget: number;
  date: string;
  location: string;
}) => {
  const res = await instance.post(`${baseURL}/api/event`, eventData);
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
