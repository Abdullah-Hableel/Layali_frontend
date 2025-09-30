import axios from "axios";
import * as SecureStore from "expo-secure-store";

const baseURL = "http://localhost:8000"; // put ur ip in between


export { baseURL };

const instance = axios.create({
  baseURL: baseURL,
  timeout: 10000,
});

instance.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

console.log("AXIOS BASE URL =>", instance.defaults.baseURL);
export default instance;
