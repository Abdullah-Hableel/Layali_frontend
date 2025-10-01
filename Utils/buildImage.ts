import { baseURL } from "@/api";

const SERVER_URL = `${baseURL}/uploads/`;

export const buildImageUrl = (img?: string) =>
  img ? `${SERVER_URL}${img}` : "https://via.placeholder.com/300x180";
