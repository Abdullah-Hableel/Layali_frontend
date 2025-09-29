import instance from ".";

export const getAllCategory = async () => {
  const res = await instance.get(`/api/category`);
  return res.data.category;
};
