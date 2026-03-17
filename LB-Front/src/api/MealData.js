import apiClient from './config';

/**
 * FastAPI 칼로리 계산 프록시 (Spring)
 * POST /meals/calculate-calories
 * body: { items: [{ name, amount_grams }] }
 */
export async function calculateMealCalories(body) {
  const { data } = await apiClient.post('/meals/calculate-calories', body);
  return data;
}

/**
 * 직접 식사 기록 생성 (meal + meal_item + diet_log 생성)
 * POST /meals/with-items
 * body: { mealType: 'B'|'L'|'D'|'S', date: 'yyyy-MM-dd', imageFileId?: number, comment?: string, items: [{ name, amount, calories, carbohydrate, protein, fat }] }
 */
export async function createMealWithItems(body) {
  const { data } = await apiClient.post('/meals/with-items', body);
  return data;
}

