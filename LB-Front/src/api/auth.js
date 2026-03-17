import apiClient, { authClient } from "./config";

export const callSignIn = async (requestData) => {
  const response = await authClient.post("/auth/login", requestData);
  return response.data;
};

export const checkEmailAvailability = async (email) => {
  try {
    // URL 파라미터(Query String)로 전달
    const response = await apiClient.get("/auth/check", {
      params: { email: email }, // 서버 파라미터명이 email인 경우
    });

    return response.data.isExist;
  } catch (error) {
    console.log("이메일 중복 체크 중 오류 발생:", error);
    throw error;
  }
};

export const callSignUp = async (requestData) => {
  try {
    const response = await authClient.post("/auth/signup", requestData);

    return response.data;
  } catch (error) {
    console.log("callSignUp() 오류 발생:", error);
    throw error;
  }
};

export const callRefresh = async () => {
  const response = await authClient.post("/auth/refresh");
  return response.data;
};

export const callLogout = async () => {
  const response = await authClient.post("/auth/logout");
  return response.data;
};
