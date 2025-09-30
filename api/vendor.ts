import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import instance from ".";
export interface Vendor {
  _id: string;
  user: string;
  business_name: string;
  bio: string;
  logo: string;
  services: string[];
  categories: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const getVendor = async () => {
  try {
    const res = await instance.get("/api/vendor");
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

export const getVendorById = async (): Promise<Vendor> => {
  const token = await SecureStore.getItemAsync("token");

  if (!token) throw new Error("User not authenticated");

  // Decode the token to extract the ID
  const decoded = jwtDecode<TokenPayload>(token);
  const vendorId = decoded._id;

  if (!vendorId) throw new Error("Invalid token: no ID found");

  const res = await instance.get<Vendor>(`/api/vendor/${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

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
