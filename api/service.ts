import * as SecureStore from "expo-secure-store";
import instance from ".";

const getServices = async () => {
  try {
    const res = await instance.get("/api/service");
    console.log(res.data);
    return res.data || [];
  } catch (error) {
    console.log("🚀 ~ getServices  ~ error:", error);
    return [];
  }
};
const createService = async (formData: FormData) => {
  const token = await SecureStore.getItemAsync("token"); // get logged-in user token
  const res = await instance.post(`/api/service`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
const getServiceById = async (id: string) => {
  console.log(id);
  try {
    const res = await instance.get(`/api/service/${id}`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.log("🚀 ~ getServiceById ~ err:", err);
  }
};
const deleteService = async (id: string) => {
  const res = await instance.delete(`/api/service/delete/${id}`);
  console.log(res.data);
  return res.data;
};
const updateService = async (id: string, data: any) => {
  const token = await SecureStore.getItemAsync("token");

  // Check if we are sending a FormData (for image upload)
  const isFormData = data instanceof FormData;

  const res = await instance.put(`/api/service/update/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
    },
  });

  return res.data;
};

export {
  createService,
  deleteService,
  getServiceById,
  getServices,
  updateService,
};
