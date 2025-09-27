import instance, { baseURL } from "./index";

export const getAllInviteTemplates = async () => {
  const res = await instance.get(
    `${baseURL}/api/inviteTemplate/getAllInviteTemplates`
  );
  return res.data;
};

export const createInviteTemplate = async (formData: FormData) => {
  const res = await instance.post(
    `${baseURL}/api/inviteTemplate/createInviteTemplate`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
};
