import apiClient from "./config";

/**
 * 파일 업로드
 * POST /file (multipart/form-data)
 * @param {File} file
 * @returns {Promise<{ id: number, filename: string, org_filename: string }|null>}
 */
export async function uploadSingleFile(file) {
  if (!file) return null;
  const formData = new FormData();
  formData.append("files", file);
  const { data } = await apiClient.post("/file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const first = Array.isArray(data) ? data[0] : null;
  return first || null;
}

