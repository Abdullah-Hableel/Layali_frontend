import instance from ".";
export const getAllCategory = async () => {
  try {
    const res = await instance.get("/api/category");
    return res.data || [];
  } catch (error) {
    console.log("🚀 ~ getCategory  ~ error:", error);
    return [];
  }
};
export async function createCategory(name: string) {
  const formData = new FormData();
  formData.append("name", name);

  const res = await instance.post("/api/category", formData, {});
  return res.data.category;
}
