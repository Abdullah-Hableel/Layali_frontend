import instance, { baseURL } from ".";
export interface Vendor {
  events: any;
  _id: string;
  user: string;
  business_name: string;
  bio: string;
  logo: string;
  services: string[];
  // services?: { name: string; price: number }[];
  categories: string[];
  createdAt?: string;
  updatedAt?: string;
  status?: "active" | "pending" | "inactive";
}

export const getVendor = async () => {
  try {
    const res = await instance.get("/api/vendor");
    console.log(res.data);
    return res.data || [];
  } catch (error) {
    console.log("🚀 ~ getVendor  ~ error:", error);
    return [];
  }
};

interface TokenPayload {
  _id: string; // or whatever your backend uses as user/vendor ID
  exp?: number;
  iat?: number;
}

export const getVendorById = async (id: string): Promise<Vendor> => {
  const res = await instance.get<Vendor>(`/api/vendor/${id}`);
  return res.data;
};

export const getVendorById2 = async (id: string) => {
  const res = await instance.get(`${baseURL}/api/vendor/${id}`);
  console.log(res.data);

  return res.data;
};

export const createVendor = async (formData: FormData) => {
  const response = await instance.post(`/api/vendor`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateVendor = async (id: string, data: FormData) => {
  const response = await instance.put(`/api/vendor/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteVendor = async (id: string) => {
  const response = await instance.delete(`/api/vendor/${id}`);
  return response.data;
};

export const deleteAllVendors = async () => {
  const response = await instance.delete(`/api/vendor/`);
  return response.data;
};
