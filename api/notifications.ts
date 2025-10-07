import instance from ".";

export const getUserNotifications = async (userId: string) => {
  const res = await instance.get(`/api/notifications/${userId}`); // ✅ FIXED
  return res.data;
};

export const markNotificationAsRead = async (id: string) => {
  const res = await instance.patch(`/api/notifications/read/${id}`);
  return res.data;
};

export const deleteNotification = async (id: string) => {
  const res = await instance.delete(`/api/notifications/${id}`);
  return res.data;
};

export const createNotification = async (payload: any) => {
  const res = await instance.post("/api/notifications", payload);
  return res.data;
};
