import * as SecureStore from "expo-secure-store";
import { deleteItemAsync } from "expo-secure-store";
const getToken = async () => {
  try {
    const token = await SecureStore.getItemAsync("token");
    return token;
  } catch (err) {
    console.log("Error reading token:", err);
    return null;
  }
};

const storeToken = async (token: string | object) => {
  try {
    const tokenString =
      typeof token === "string" ? token : JSON.stringify(token);
    await SecureStore.setItemAsync("token", tokenString);
  } catch (err) {
    console.log("Error storing token:", err);
  }
};

const deleteToken = async () => {
  try {
    await deleteItemAsync("token");
  } catch (error) {
    console.error("Error deleting token:", error);
  }
};

const storeUser = async (user: object) => {
  try {
    await SecureStore.setItemAsync("user", JSON.stringify(user));
  } catch (err) {
    console.log("Error storing user:", err);
  }
};
const getUser = async () => {
  try {
    const raw = await SecureStore.getItemAsync("user");
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.log("Error reading user:", err);
    return null;
  }
};
const deleteUser = async () => {
  try {
    await SecureStore.deleteItemAsync("user");
  } catch (err) {
    console.error("Error deleting user:", err);
  }
};
const clearAll = async () => {
  await Promise.all([deleteUser(), deleteToken()]);
};
export {
  clearAll,
  deleteItemAsync,
  deleteToken,
  getToken,
  getUser,
  storeToken,
  storeUser,
};
