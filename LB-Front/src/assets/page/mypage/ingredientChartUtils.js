const PIE_COLORS = [
  '#d6cdea',
  '#e9b1f7',
  '#fcd0d0',
  '#cdebcf',
  '#f9cd9e',
  '#a8e6cf',
  '#ffd3b6',
  '#dcb5ff',
  '#9bf6ff',
  '#b4e7ce',
];

export const EMPTY_INGREDIENT_CHART = {
  labels: ['기록 없음'],
  datasets: [{ data: [1], backgroundColor: ['#e5e7eb'], borderWidth: 1 }],
};

export function parseIngredients(ingredientsRaw) {
  if (!ingredientsRaw) return [];
  if (Array.isArray(ingredientsRaw)) {
    return ingredientsRaw.map((value) => String(value).trim()).filter(Boolean);
  }
  if (typeof ingredientsRaw !== 'string') return [];

  try {
    const parsed = JSON.parse(ingredientsRaw);
    return Array.isArray(parsed)
      ? parsed.map((value) => String(value).trim()).filter(Boolean)
      : [];
  } catch {
    return ingredientsRaw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }
}

export function buildIngredientChartData(items) {
  const countByIngredient = {};

  items.forEach((item) => {
    let ingredients = parseIngredients(item.ingredients);

    if (!ingredients.length) {
      const fallbackName = String(item.name ?? '').trim();
      if (fallbackName) ingredients = [fallbackName];
    }

    ingredients.forEach((ingredient) => {
      const key = String(ingredient).trim();
      if (!key) return;
      countByIngredient[key] = (countByIngredient[key] || 0) + 1;
    });
  });

  const entries = Object.entries(countByIngredient).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return EMPTY_INGREDIENT_CHART;

  const maxSlices = 10;
  const topEntries = entries.slice(0, maxSlices);
  const restCount = entries
    .slice(maxSlices)
    .reduce((sum, [, count]) => sum + count, 0);

  const labels = topEntries.map(([name]) => name);
  const data = topEntries.map(([, count]) => count);

  if (restCount > 0) {
    labels.push('기타');
    data.push(restCount);
  }

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: labels.map(
          (_, index) => PIE_COLORS[index % PIE_COLORS.length],
        ),
        borderWidth: 1,
      },
    ],
  };
}
