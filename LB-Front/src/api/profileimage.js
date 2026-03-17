import { apiClient, BASE_URL } from "./config";

/** 썸네일 URL: "t_" + filename + ".jpg" */
export const getProfileImageThumbnailUrl = (profileImage) => {
  if (!profileImage?.filename) return null;
  const thumbnailFilename = `t_${profileImage.filename}.jpg`;
  return `${BASE_URL}/file/${thumbnailFilename}`;
};

/** 프로필 이미지 조회 (GET /me/profile-image) */
export const getProfileImage = async () => {
  try {
    const { data } = await apiClient.get("/me/profile-image");
    return data;
  } catch {
    return null;
  }
};

/** 프로필 이미지 교체 (PATCH /me/profile-image, multipart/form-data, key: file) */
export const updateProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.patch("/me/profile-image", formData);
  return response.data;
};

/** 프로필 이미지 삭제 (DELETE /me/profile-image) */
export const deleteProfileImage = async () => {
  await apiClient.delete("/me/profile-image");
};
