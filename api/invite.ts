import instance, { baseURL } from "./index";

export const createInvite = async (inviteData: {
  event?: string | null;
  guestName: string;
  guestEmail: string;
  inviteTemplate?: string;
}) => {
  try {
    const payload = {
      ...inviteData,
      event: inviteData.event || null,
    };
    const res = await instance.post(
      `${baseURL}/api/invite/createInvite`,
      payload
    );
    return res.data;
  } catch (err: any) {
    // console.error("createInvite error:", err.response?.data || err.message);
    return (
      err?.response?.data?.message || err.message || "Something went wrong."
    );
  }
};

export const getAllInvites = async () => {
  const res = await instance.get(`${baseURL}/api/invite/getAllInvites`);
  return res.data;
};

export const getInvitesByEvent = async (eventId: string) => {
  try {
    const res = await instance.get(
      `${baseURL}/api/invite/getInvitesByEvent/${eventId}`
    );
    return res.data;
  } catch (err: any) {
    console.error(
      "getInvitesByEvent error:",
      err.response?.data || err.message
    );
    throw err;
  }
};

export const updateRSVP = async (token: string, rsvpStatus: string) => {
  const res = await instance.post(`${baseURL}/api/invite/rsvp/${token}`, {
    rsvpStatus,
  });
  return res.data;
};
