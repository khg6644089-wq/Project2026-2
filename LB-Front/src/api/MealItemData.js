import apiClient from './config';

/**
 * 특정 meal에 속한 meal_item 목록 조회
 * GET /meals/{mealId}/items
 */
export async function getMealItemsByMealId(mealId) {
  if (mealId == null) throw new Error('mealId is required');
  const { data } = await apiClient.get(`/meals/${mealId}/items`);
  return data;
}

/**
 * 특정 meal에 MealItem 추가
 * POST /meals/{mealId}/items
 * @param {number} mealId
 * @param {{ name: string, amount?: number, carbohydrate?: number, protein?: number, fat?: number, calories?: number }} body
 */
export async function createMealItem(mealId, body) {
  const { data } = await apiClient.post(`/meals/${mealId}/items`, body);
  return data;
}

/**
 * MealItem 삭제
 * DELETE /meal-items/{id}
 */
export async function deleteMealItem(itemId) {
  await apiClient.delete(`/meal-items/${itemId}`);
}

/**
 * MealItem 수정
 * PUT /meal-items/{id}
 */
export async function updateMealItem(itemId, body) {
  const { data } = await apiClient.put(`/meal-items/${itemId}`, body);
  return data;
}

