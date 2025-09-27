import instance from ".";

const getServices = async () => {
  try {
    const res = await instance.get("/api/service");
    return res.data || [];
  } catch (error) {
    console.log("🚀 ~ getServices  ~ error:", error);
    return [];
  }
};
export { getServices };
