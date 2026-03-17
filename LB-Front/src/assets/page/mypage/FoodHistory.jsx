import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Chart from "../../../components/ChartComp";
import BtnComp from "../../../components/BtnComp";
import { barChartOptions } from "../../../api/TestChartData";
import {
  deleteDietLog,
  getDietLogs,
  getDietLogsByDate,
} from "../../../api/DietLogData";
import { getMealItemsByMealId } from "../../../api/MealItemData";
import { apiClient, BASE_URL } from "../../../api/config";

const MEAL_TYPE_LABEL = {
  B: "아침",
  L: "점심",
  D: "저녁",
  S: "간식",
};

const PIE_COLORS = [
  "#d6cdea",
  "#e9b1f7",
  "#fcd0d0",
  "#cdebcf",
  "#f9cd9e",
  "#a8e6cf",
  "#ffd3b6",
  "#dcb5ff",
  "#9bf6ff",
  "#b4e7ce",
];

const DEFAULT_MEAL_IMAGE =
  "https://ynczwbybtbjftkatmcxg.supabase.co/storage/v1/object/sign/LB/Frame%2068.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjY5YTJlMy0zNGQxLTRkNTMtYWYzMC0wOWM5OTZhMzE0ODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9GcmFtZSA2OC5wbmciLCJpYXQiOjE3NzI2NzU0NzAsImV4cCI6MTgwNDIxMTQ3MH0.ErPbcwDA4-KdW-Edr1iVtdJrOjrJQkwLLORgS70TcUA";

const EMPTY_INGREDIENT_CHART = {
  labels: ["기록 없음"],
  datasets: [{ data: [1], backgroundColor: ["#e5e7eb"], borderWidth: 1 }],
};

const EMPTY_WEEKLY_BAR_DATA = [0, 0, 0, 0, 0, 0, 0];

function getTodayLocalDateStr() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = String(dateStr).split("-").map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseIngredients(ingredientsRaw) {
  if (!ingredientsRaw) return [];
  if (Array.isArray(ingredientsRaw)) {
    return ingredientsRaw.map((value) => String(value).trim()).filter(Boolean);
  }
  if (typeof ingredientsRaw !== "string") return [];

  try {
    const parsed = JSON.parse(ingredientsRaw);
    return Array.isArray(parsed)
      ? parsed.map((value) => String(value).trim()).filter(Boolean)
      : [];
  } catch {
    return ingredientsRaw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }
}

function buildWeeklyBarData(labels, data) {
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: "rgba(177, 239, 102, 0.6)",
        borderColor: "#b1ef66",
        borderWidth: 1,
      },
    ],
  };
}

function getDateOnly(value) {
  if (!value) return "";
  if (value instanceof Date) return formatLocalDate(value);

  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime())
    ? raw.slice(0, 10)
    : formatLocalDate(parsed);
}

function getWeekRange(dateStr) {
  const base = parseLocalDate(dateStr);
  if (Number.isNaN(base.getTime())) return null;

  const diffToMonday = (base.getDay() + 6) % 7;
  const monday = new Date(base);
  monday.setDate(base.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });

  return {
    fromDate: formatLocalDate(dates[0]),
    toDate: formatLocalDate(dates[6]),
    labels: dates.map((date) => `${date.getMonth() + 1}/${date.getDate()}`),
    dateStrings: dates.map((date) => formatLocalDate(date)),
  };
}

function buildIngredientChartData(items) {
  const countByIngredient = {};

  items.forEach((item) => {
    let ingredients = parseIngredients(item.ingredients);

    if (!ingredients.length) {
      const fallbackName = String(item.name ?? "").trim();
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
    labels.push("기타");
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

function getMealImageUrl(logs) {
  const firstWithImage = logs.find((log) => {
    const meal = log?.meal;
    return (
      meal?.imageUrl ||
      meal?.photoUrl ||
      meal?.image ||
      meal?.imageData ||
      log?.imageUrl ||
      log?.photoUrl ||
      log?.image
    );
  });

  const firstMeal = firstWithImage?.meal ?? logs[0]?.meal;
  const imageFileId =
    firstMeal?.imageFileId ??
    firstMeal?.image_file_id ??
    firstMeal?.fileId ??
    firstMeal?.file_id ??
    null;

  return (
    (imageFileId != null ? `${BASE_URL}/file/id/${imageFileId}` : null) ||
    firstMeal?.imageUrl ||
    firstMeal?.photoUrl ||
    firstMeal?.image ||
    firstMeal?.imageData ||
    firstWithImage?.imageUrl ||
    firstWithImage?.photoUrl ||
    firstWithImage?.image ||
    null
  );
}

function getDisplayItems(items) {
  return items.filter(
    (item) => Number(item.kcal) > 0 && String(item.name ?? "").trim() !== "",
  );
}

function FoodHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const handledLocationKeyRef = useRef(null);

  const [selectedDate, setSelectedDate] = useState(() =>
    getTodayLocalDateStr(),
  );
  const [dietLogs, setDietLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [goalCalories, setGoalCalories] = useState(2000);
  const [ingredientChartData, setIngredientChartData] = useState(
    EMPTY_INGREDIENT_CHART,
  );
  const [mealImageUrlByType, setMealImageUrlByType] = useState({});
  const [weeklySummary, setWeeklySummary] = useState({
    averageKcal: 0,
    recordedDays: 0,
    noRecordDays: 7,
    barData: buildWeeklyBarData(
      ["월", "화", "수", "목", "금", "토", "일"],
      EMPTY_WEEKLY_BAR_DATA,
    ),
  });

  useEffect(() => {
    const message = location.state?.successMessage;
    if (!message) return;
    if (handledLocationKeyRef.current === location.key) return;

    handledLocationKeyRef.current = location.key;
    setSuccessMessage(message);

    const timeoutId = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timeoutId);
  }, [location.key, location.state?.successMessage]);

  useEffect(() => {
    let cancelled = false;

    const fetchGoalCalories = async () => {
      try {
        const response = await apiClient.get("/me");
        const rawCalories =
          response?.data?.daily_calories ?? response?.data?.dailyCalories;

        if (!cancelled && rawCalories != null) {
          setGoalCalories(Number(rawCalories) || 2000);
        }
      } catch (fetchError) {
        console.error("일일 목표 칼로리 조회 실패:", fetchError);
      }
    };

    fetchGoalCalories();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchDietLogs = useCallback(async (dateStr) => {
    setLoading(true);
    setError(null);
    setDietLogs([]);
    setMealImageUrlByType({});

    try {
      const list = await getDietLogsByDate(dateStr);
      setDietLogs(Array.isArray(list) ? list : []);
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.message ||
          fetchError.message ||
          "식사 기록을 불러오지 못했습니다.",
      );
      setDietLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDietLogs(selectedDate);
  }, [fetchDietLogs, selectedDate]);

  const handleDeleteMealType = async (logIds) => {
    if (!logIds?.length) return;

    const confirmed = window.confirm(
      "해당 끼니의 기록을 삭제할까요? 식단 전체가 삭제됩니다.",
    );
    if (!confirmed) return;

    try {
      await Promise.all(logIds.map((id) => deleteDietLog(id)));
      await fetchDietLogs(selectedDate);
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message ||
          deleteError.message ||
          "삭제에 실패했습니다.",
      );
    }
  };

  useEffect(() => {
    if (!selectedDate) return;

    let cancelled = false;
    const weekRange = getWeekRange(selectedDate);
    if (!weekRange) return;

    const { fromDate, toDate, labels, dateStrings } = weekRange;

    (async () => {
      try {
        const logs = await getDietLogs({ fromDate, toDate });
        if (cancelled) return;

        const list = Array.isArray(logs) ? logs : [];
        const totalByDate = list.reduce((acc, log) => {
          const key = getDateOnly(log.dateAt);
          acc[key] = (acc[key] || 0) + (log.meal?.totalCalories ?? 0);
          return acc;
        }, {});

        const dayTotals = dateStrings.map((date) => totalByDate[date] || 0);
        const weeklyTotal = dayTotals.reduce((sum, value) => sum + value, 0);
        const recordedDays = dayTotals.filter((value) => value > 0).length;

        setWeeklySummary({
          averageKcal: Math.round(weeklyTotal / 7),
          recordedDays,
          noRecordDays: 7 - recordedDays,
          barData: buildWeeklyBarData(labels, dayTotals),
        });
      } catch {
        if (cancelled) return;

        setWeeklySummary({
          averageKcal: 0,
          recordedDays: 0,
          noRecordDays: 7,
          barData: buildWeeklyBarData(labels, EMPTY_WEEKLY_BAR_DATA),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate) {
      setIngredientChartData(EMPTY_INGREDIENT_CHART);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const logs = await getDietLogsByDate(selectedDate);
        if (cancelled) return;

        const mealIds = [
          ...new Set(
            (Array.isArray(logs) ? logs : [])
              .map((log) => log.mealId)
              .filter((mealId) => mealId != null),
          ),
        ];

        if (!mealIds.length) {
          setIngredientChartData(EMPTY_INGREDIENT_CHART);
          return;
        }

        const itemsByMeal = await Promise.all(
          mealIds.map((mealId) =>
            getMealItemsByMealId(mealId).then((items) =>
              Array.isArray(items) ? items : [],
            ),
          ),
        );

        if (!cancelled) {
          setIngredientChartData(buildIngredientChartData(itemsByMeal.flat()));
        }
      } catch {
        if (!cancelled) {
          setIngredientChartData(EMPTY_INGREDIENT_CHART);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const mealLogsByType = useMemo(
    () =>
      dietLogs.reduce((acc, log) => {
        const mealType = String(log?.meal?.mealType ?? "");
        if (!mealType) return acc;

        if (!acc[mealType]) acc[mealType] = [];
        acc[mealType].push(log);
        return acc;
      }, {}),
    [dietLogs],
  );

  const mealListByType = useMemo(
    () =>
      Object.entries(MEAL_TYPE_LABEL).map(([type, label]) => {
        const logs = mealLogsByType[type] ?? [];
        const items = logs.map((log) => ({
          id: log.id,
          name: log.meal?.menu ?? "(메뉴 없음)",
          kcal: log.meal?.totalCalories ?? 0,
        }));

        return {
          type,
          label,
          total: logs.reduce(
            (sum, log) => sum + (log.meal?.totalCalories ?? 0),
            0,
          ),
          items,
          displayItems: getDisplayItems(items),
          imageUrl: getMealImageUrl(logs),
          logIds: logs.map((log) => log.id),
        };
      }),
    [mealLogsByType],
  );

  useEffect(() => {
    let cancelled = false;
    const objectUrlsToRevoke = [];

    const buildMealImageMap = async () => {
      setMealImageUrlByType({});

      const nextMap = {};
      await Promise.all(
        mealListByType.map(async (meal) => {
          const logs = mealLogsByType[meal.type] ?? [];
          const imageFileId =
            logs.find((log) => log?.meal?.imageFileId != null)?.meal
              ?.imageFileId ?? null;

          if (!imageFileId) return;

          try {
            const response = await apiClient.get(`/file/id/${imageFileId}`, {
              responseType: "blob",
            });
            const objectUrl = URL.createObjectURL(response.data);
            objectUrlsToRevoke.push(objectUrl);
            nextMap[meal.type] = objectUrl;
          } catch {
            // ignore image fetch errors
          }
        }),
      );

      if (!cancelled) {
        setMealImageUrlByType(nextMap);
      }
    };

    buildMealImageMap();
    return () => {
      cancelled = true;
      objectUrlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [mealListByType, mealLogsByType]);

  const hasAnyMeals = mealListByType.some((meal) => meal.items.length > 0);
  const totalIntake = mealListByType.reduce((sum, meal) => sum + meal.total, 0);
  const calorieDiff = goalCalories - totalIntake;

  return (
    <>
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
      <section className="wrap bg-white pt-[2%] py-10">
        <div className="containers mx-auto text-center">
          <h3 className="text-deep text-base md:text-lg lg:text-xl xl:text-2xl">
            <i className="fa-solid fa-utensils mr-5" />
            나의 식사 기록
          </h3>

          <hr className=" mt-[4%] border-t-10 border-main-02 my-4" />

          {successMessage && (
            <p className="text-green-600 text-sm mt-3">{successMessage}</p>
          )}

          <h3 className="mt-[5%] text-main-02 !text-lg !sm:text-2xl ">
            오늘의 섭취량 : {totalIntake} kcal / 목표 : {goalCalories} kcal
          </h3>

          <h3 className="mt-4 text-deep text-base md:text-lg lg:text-xl xl:text-2xl">
            오늘의 재료 구성
          </h3>

          <div className="w-[90%] md:w-full max-w-[520px] mx-auto mt-6 border border-main-02 rounded-xl p-6 shadow-sm">
            <Chart type="pie" data={ingredientChartData} />
          </div>

          <p className="mt-6 text-main-02 text-base md:text-lg max-w-[520px] mx-auto">
            오늘 섭취량이 목표 대비 {Math.abs(calorieDiff)} kcal{" "}
            {calorieDiff >= 0 ? "부족" : "초과"} 했습니다.
          </p>

          <div className="w-full max-w-[520px] mx-auto mt-6">
            <BtnComp
              size="long"
              variant="primary"
              onClick={() =>
                navigate("../food_historywrite", {
                  state: { editDate: selectedDate, mode: "create" },
                })
              }
            >
              오늘의 식사 입력하기
            </BtnComp>
          </div>
        </div>
      </section>

      <section className="wrap !bg-light-02 py-10">
        <div className="containers mx-auto px-4">
          <header className="text-center mb-8">
            <div>
              <h3 className="text-main-02 flex justify-center items-center gap-2">
                <i className="fa-solid fa-utensils mr-3" />
                일별 식사 기록 리스트
              </h3>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="inline-block bg-green-500 text-white text-sm md:text-base px-4 py-2 rounded-full mt-1 border-0 cursor-pointer min-w-[170px] "
            />
          </header>

          {error && (
            <p className="text-red-600 text-sm text-center mb-4">{error}</p>
          )}

          {loading ? (
            <p className="text-center text-main-02">
              식사 기록을 불러오는 중...
            </p>
          ) : !hasAnyMeals ? (
            <p className="text-center text-gray-500">
              해당 날짜의 식사 기록이 없습니다. 식단 관리에서 추천 받고
              저장하기를 눌러보세요.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {mealListByType.map((meal) => (
                <div key={meal.type} className="flex flex-col items-center">
                  <h3 className="mb-4 text-base font-semibold text-deep">
                    {meal.label}
                  </h3>

                  <article className="max-w-[340px] w-full bg-white rounded-xl border border-main-02 p-4 flex flex-col items-center shadow">
                    <div className="w-[90%] aspect-square rounded-full overflow-hidden border my-8">
                      <img
                        src={
                          mealImageUrlByType[meal.type] ||
                          meal.imageUrl ||
                          DEFAULT_MEAL_IMAGE
                        }
                        alt={meal.label}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <ul className="text-base text-bg-gray-mid mb-6 text-center leading-7">
                      {meal.displayItems.length === 0 ? (
                        <li className="text-gray-400">기록 없음</li>
                      ) : (
                        meal.displayItems.slice(0, 1).map((item) => (
                          <li key={item.id}>
                            {String(item.name).trim()} : {item.kcal} kcal
                          </li>
                        ))
                      )}
                    </ul>

                    <p className="text-main-02 !text-3xl font-extrabold">
                      {meal.total} kcal
                    </p>

                    {meal.displayItems.length === 0 ? (
                      <div className="flex justify-center items-center mt-4">
                        <BtnComp
                          size="long"
                          variant="primary"
                          className="px-6 py-3 text-base md:text-lg rounded-lg"
                          onClick={() =>
                            navigate("../food_historywrite", {
                              state: {
                                editDate: selectedDate,
                                mode: "create",
                                mealType: meal.type,
                              },
                            })
                          }
                        >
                          추가
                        </BtnComp>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center mt-4 gap-4">
                        <BtnComp
                          size="long"
                          variant="primary"
                          className="px-6 py-3 text-base md:text-lg rounded-lg"
                          onClick={() =>
                            navigate("../food_historywrite", {
                              state: {
                                editDate: selectedDate,
                                mealType: meal.type,
                              },
                            })
                          }
                        >
                          수정
                        </BtnComp>
                        <BtnComp
                          size="long"
                          variant="primary"
                          className="px-6 py-3 text-base md:text-lg rounded-lg"
                          onClick={() => handleDeleteMealType(meal.logIds)}
                        >
                          삭제
                        </BtnComp>
                      </div>
                    )}
                  </article>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="wrap bg-white mb-[10%] py-10">
        <div className="w-[90%] md:w-full max-w-[1040px] mx-auto rounded-xl p-6 shadow-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span className="w-12 h-5 bg-main-01" />
              <span>주간 총 섭취 칼로리</span>
            </div>

            <h2 className="!text-2xl  font-bold text-green-600">
              주간 평균 {weeklySummary.averageKcal} kcal
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              기록 {weeklySummary.recordedDays}일 / 미기록{" "}
              {weeklySummary.noRecordDays}일
            </p>
          </div>

          <Chart
            type="bar"
            data={weeklySummary.barData}
            options={barChartOptions}
          />
        </div>
      </section>
    </>
  );
}

export default FoodHistory;
