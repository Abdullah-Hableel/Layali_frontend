import instance from "./index";
import { storeToken } from "./storage";
interface UserInfo {
  email: string;
  password: string;
}
const login = async (userInfo: UserInfo) => {
  const response = await instance.post("/api/auth/signin", userInfo);
  await storeToken(response.data.token);
  console.log(response.data.token);

  return response.data;
};

const register = async (userInfo: FormData) => {
  const res = await instance.post("/api/auth/signup", userInfo);
  await storeToken(res.data.token);
  console.log(res.data);

  return res.data;
};
export { login, register };
