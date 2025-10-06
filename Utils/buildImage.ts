import { baseURL } from "@/api";

const SERVER_URL = `${baseURL}/uploads/`;
export const FALLBACK_IMG = require("../assets/images/NotFoundimg.png");

export const buildImageUrl = (img?: string) =>
  img ? `${SERVER_URL}${img}` : require("../assets/images/NotFoundimg.png");
