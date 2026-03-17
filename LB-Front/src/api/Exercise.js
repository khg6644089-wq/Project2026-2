import apiClient from "./config";

export const getExercises = async () => {
  const response = await apiClient.get("/api/exercises");
  return response.data;
};
