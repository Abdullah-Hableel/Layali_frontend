import { JwtPayload } from "@/data/jwtPayload";
import { User } from "@/data/user";
import { UserInfo } from "@/data/userInfo";
import { jwtDecode } from "jwt-decode";
import instance from "./index";
import { storeToken, storeUser } from "./storage";

const getUserById = async (id: string, token: string): Promise<User> => {
  const res = await instance.get(`/api/getuser/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as User;
};

const login = async (userInfo: UserInfo) => {
  const response = await instance.post("/api/auth/signin", userInfo);
  const token: string = response.data.token;
  console.log("[LOGIN] token from API:", token);

  await storeToken(token);

  const decoded = jwtDecode<JwtPayload>(token);
  console.log("[LOGIN] decoded payload:", decoded);

  if (!decoded?._id) throw new Error("Invalid token payload (no _id)");

  const user = await getUserById(decoded._id, token);
  console.log("[LOGIN] fetched user:", user);

  await storeUser(user);
  console.log("[LOGIN] user stored ✓");

  return { token, user };
};

const register = async (userInfo: FormData) => {
  const response = await instance.post("/api/auth/signup", userInfo);
  const token: string = response.data.token;
  console.log("[Signup/Register] token from API:", token);

  await storeToken(response.data.token);

  const decoded = jwtDecode<JwtPayload>(token);
  console.log("[Signup/Register] decoded payload:", decoded);

  if (!decoded?._id) throw new Error("Invalid token payload (no _id)");

  const user = await getUserById(decoded._id, token);
  console.log("[Signup/Register] fetched user:", user);

  await storeUser(user);
  console.log("[Signup/Register] user stored ✓");

  return { token, user };
};
export { login, register };
