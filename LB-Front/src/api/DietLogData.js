import apiClient from './config';

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLocalDateKey(value) {
  if (!value) return '';

  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw.slice(0, 10) : formatLocalDate(parsed);
}

/**
 * 로그인 사용자의 식단 기록(diet_log) 목록 조회
 * @param {string} date - 'yyyy-MM-dd' (해당 날짜만)
 * @param {string} fromDate - 'yyyy-MM-dd' (기간 조회 시)
 * @param {string} toDate - 'yyyy-MM-dd' (기간 조회 시)
 * @returns {Promise<Array<{ id, memberId, mealId, dateAt, meal: { mealType, menu, totalCalories, ... } }>>}
 */
export async function getDietLogs(params = {}) {
  const { data } = await apiClient.get('/diet-logs', { params });
  return data;
}

/**
 * 특정 날짜의 식사 기록만 조회 (일별 식사 기록 리스트용)
 * @param {string} dateStr - 'yyyy-MM-dd'
 */
export async function getDietLogsByDate(dateStr) {
  const logs = await getDietLogs({ date: dateStr });
  const list = Array.isArray(logs) ? logs : [];
  return list.filter((log) => getLocalDateKey(log?.dateAt) === dateStr);
}

/**
 * 식단 기록(diet_log) 삭제
 * DELETE /diet-logs/{id}
 */
export async function deleteDietLog(id) {
  if (id == null) throw new Error('dietLog id is required');
  await apiClient.delete(`/diet-logs/${id}`);
}
