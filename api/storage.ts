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

export { deleteToken, getToken, storeToken };
