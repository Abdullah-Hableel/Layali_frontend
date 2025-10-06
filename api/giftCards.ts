import instance, { baseURL } from "./index";
import { getToken } from "./storage";

export const createGiftCard = async (data: {
  senderEmail: string;
  coupleEmail: string;
  amount: number;
  expirationDate?: string;
}) => {
  const token = await getToken();
  const res = await instance.post(`${baseURL}/api/giftcards`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateGiftCard = async (id: string, updateData: any) => {
  const token = await getToken();
  const res = await instance.put(`${baseURL}/api/giftcards/${id}`, updateData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteGiftCard = async (id: string) => {
  const token = await getToken();
  const res = await instance.delete(`${baseURL}/api/giftcards/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
export const redeemGiftCard = async (
  id: string,
  data: { redeemedBy: string }
) => {
  const token = await getToken();
  const url = `${baseURL}/api/giftcards/${id}/redeem`;
  console.log("🚀 Redeem URL =>", url, data); // ✅ يطبع قبل الإرسال
  const res = await instance.post(url, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("✅ Redeem Response =>", res.data);
  return res.data;
};

export const getAllGiftCards = async () => {
  const res = await instance.get(`${baseURL}/api/giftcards`);
  return res.data;
};

export const getGiftCardById = async (id: string) => {
  const res = await instance.get(`${baseURL}/api/giftcards/${id}`);
  return res.data;
};

export const getGiftCardsByUser = async (userId: string) => {
  const token = await getToken();
  const res = await instance.get(`${baseURL}/api/giftcards/user/${userId}`);
  return res.data;
};

// import instance, { baseURL } from "./index";
// import { getToken } from "./storage";

// export const createGiftCard = async (data: {
//   senderEmail: string;
//   coupleEmail: string;
//   amount: number;
//   expirationDate?: string;
// }) => {
//   const token = await getToken();
//   const res = await instance.post(`${baseURL}/api/giftcards`, data);
//   return res.data;
// };

// export const getAllGiftCards = async () => {
//   const res = await instance.get(`${baseURL}/api/giftcards`);
//   return res.data;
// };

// export const getGiftCardById = async (id: string) => {
//   const res = await instance.get(`${baseURL}/api/giftcards/${id}`);
//   return res.data;
// };

// export const updateGiftCard = async (id: string, updateData: any) => {
//   const token = await getToken();
//   const res = await instance.put(`${baseURL}/api/giftcards/${id}`, updateData);

//   return res.data;
// };

// export const deleteGiftCard = async (id: string) => {
//   const token = await getToken();
//   const res = await instance.delete(`${baseURL}/api/giftcards/${id}`);
//   return res.data;
// };

// export const redeemGiftCard = async (
//   id: string,
//   data: { redeemedBy: string }
// ) => {
//   const token = await getToken();
//   const res = await instance.post(
//     `${baseURL}/api/giftcards/${id}/redeem`,
//     data
//   );
//   return res.data;
// };
// export const getGiftCardsByUser = async (userId: string) => {
//   const token = await getToken();
//   const res = await instance.get(`${baseURL}/api/giftcards/user/${userId}`);
//   return res.data;
// };
