import apiClient from "./config";

// 운동 칼로리 계산
export const calculateWorkout = async (payload) => {
  const response = await apiClient.post("/workouts/calc", payload);
  return response.data;
};

// 운동 기록 저장
export const createWorkout = async (data) => {
  const response = await apiClient.post("/workouts", data);
  return response.data;
};

// 운동 기록 조회
export const getWorkouts = async (params) => {
  const response = await apiClient.get("/workouts", { params });
  return response.data;
};

// 운동 삭제
export const deleteWorkout = async (workoutId) => {
  const response = await apiClient.delete(`/workouts/${workoutId}`);
  return response.data;
};

// 운동 기록 수정
export const updateWorkout = async (workoutId, data) => {
  const response = await apiClient.put(`/workouts/${workoutId}`, data);
  return response.data;
};

// 날짜별 운동 조회

export const getWorkoutByDate = async (date) => {
  const response = await apiClient.get("/workouts/date", {
    params: { date },
  });
  return response.data;
};
