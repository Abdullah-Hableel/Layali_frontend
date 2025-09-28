import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import instance from "."; // your axios instance

export interface TokenPayload {
  _id: string;
  exp?: number;
  iat?: number;
}
export type UserAttrs = {
  _id: string;

  role: "Admin" | "Vendor" | "Normal";
  username: string;
  email: string;
  password: string;
  image: string;
  vendors: string[];
  events: string[];
};

export const getUserById = async (): Promise<UserAttrs> => {
  const token = await SecureStore.getItemAsync("token");

  if (!token) throw new Error("User not authenticated");

  const decoded = jwtDecode<TokenPayload>(token);
  const userId = decoded._id;

  if (!userId) throw new Error("Invalid token: no ID found");

  const res = await instance.get<UserAttrs>(`/api/getuser/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Optional: fetch all users
export const getAllUsers = async (): Promise<UserAttrs[]> => {
  try {
    const res = await instance.get<UserAttrs[]>("/api/users");
    return res.data || [];
  } catch (error) {
    console.log("🚀 ~ getAllUsers ~ error:", error);
    return [];
  }
};
