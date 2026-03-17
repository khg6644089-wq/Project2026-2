import apiClient from './config';

/**
 * 오늘 날짜의 내 추천 식단 목록 조회 (아침/점심/저녁)
 * @returns {Promise<Array<{ id, mealId, dateAt, isAccepted, mealType, menu, totalCalories, carbohydrate, protein, fat, comment }>>}
 */
export async function getTodayMealPlans() {
  const { data } = await apiClient.get('/meal-plans/today');
  return data;
}

/**
 * 오늘 추천 식단 새로 받기 (기존 건 삭제 후 재생성).
 * 응답에 comment, goal, breakfast, lunch, dinner, cautions 등 포함.
 * @returns {Promise<{ comment?: string, goal?: string, breakfast?: object, lunch?: object, dinner?: object, cautions?: string[] }>}
 */
export async function replaceTodayRecommendations() {
  const { data } = await apiClient.post('/meal-plans/recommend/today/replace');
  return typeof data === 'string' ? JSON.parse(data) : data;
}

/**
 * 오늘 추천 식단 받기 (최초 1회용, 이미 있으면 중복 생성될 수 있음).
 * 가능하면 replaceTodayRecommendations() 사용 권장.
 * @returns {Promise<{ comment?: string, goal?: string, breakfast?: object, lunch?: object, dinner?: object, cautions?: string[] }>}
 */
export async function recommendToday() {
  const { data } = await apiClient.post('/meal-plans/recommend/today');
  return typeof data === 'string' ? JSON.parse(data) : data;
}

/**
 * 오늘 추천 식단 전체 채택 (저장하기) — 미채택 아침/점심/저녁을 diet_log에 저장
 * @returns {Promise<Array>}
 */
export async function acceptTodayMealPlans() {
  const { data } = await apiClient.post('/meal-plans/today/accept');
  return data;
}
