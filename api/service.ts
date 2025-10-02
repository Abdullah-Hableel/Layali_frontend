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
  const res = await instance.get(`/api/service/${id}`);
  console.log(res.data);
  return res.data;
};

export { createService, getServiceById, getServices };
