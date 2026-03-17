import apiClient from "./config";

// 등록
export const addWeekHistory = async (data) => {
  const response = await apiClient.post("/api/weight/week-history", data);
  return response.data;
};

// 수정
export const updateWeekHistory = async (id, data) => {
  const response = await apiClient.put(`/api/weight/week-history/${id}`, data);
  return response.data;
};

// 삭제
export const deleteWeekHistory = async (id) => {
  const response = await apiClient.delete(`/api/weight/week-history/${id}`);
  return response.data;
};

// 페이징 조회
export const getWeekHistoryPaged = async (params) => {
  const response = await apiClient.get("/api/weight/week-history/paged", { params });
  return response.data;
};

// 전체 조회
export const getWeekHistoryAll = async (params) => {
  const response = await apiClient.get("/api/weight/week-history/all", { params });
  return response.data;
};
