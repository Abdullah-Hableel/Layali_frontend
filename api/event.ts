import { Event, EventStats, EventWithServiceCount } from "@/data/events";
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
  const token = await getToken();
  console.log(token);
  const res = await instance.put(`${baseURL}/api/event/${id}`, updateData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.event;
};

export const deleteEvent = async (id: string) => {
  const token = await getToken();
  console.log(token);
  const res = await instance.delete(`${baseURL}/api/event/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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

export const getMyEventStats = async () => {
  const token = await getToken();
  const res = await instance.get("/api/event/stats", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.stats as EventStats;
};

export const listEventsWithServiceCount = async () => {
  const token = await getToken();
  const res = await instance.get("/api/event/list", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.stats as EventWithServiceCount;
};

export const getEventServices = async (eventId: string) => {
  const token = await getToken();
  const { data } = await instance.get(`/api/event/services/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data as {
    _id: string;
    servicesCount: number;
    services: { _id: string; name: string; price: number }[];
  };
};

export const addServiceToEvent = async (id: string, serviceId: string) => {
  const token = await getToken();
  const { data } = await instance.patch(
    `/api/event/${id}/services`,
    { serviceId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data?.event ?? data;
};

export const deleteServiceFromEvent = async (params: {
  eventId: string;
  serviceId: string;
}) => {
  const { eventId, serviceId } = params;
  const { data } = await instance.delete(
    `api/event/${eventId}/services/${serviceId}`
  );
  return data;
};
