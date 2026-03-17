import React, { useState, useEffect, useCallback } from "react";
import BtnComp from "../../../components/BtnComp";
import DonutChart from "../../../components/charts/DonutChart";
import {
  getTodayMealPlans,
  replaceTodayRecommendations,
  acceptTodayMealPlans,
} from "../../../api/MealPlanData";
import { getMealItemsByMealId } from "../../../api/MealItemData";
import { useAuthStore } from "../../../stores/authStore";

const DEFAULT_COMMENT =
  "현재 체중과 활동량을 반영하여 영양 균형이 맞는 식단으로 자동 추천되었습니다. 목표 달성을 위해 이 식단을 추천합니다.";

function FoodManagement() {
  const { user } = useAuthStore();
  const [mealPlans, setMealPlans] = useState([]);
  const [mealItemsByMealId, setMealItemsByMealId] = useState({});
  const [recommendComment, setRecommendComment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTodayPlans = useCallback(async () => {
    try {
      setError(null);
      const data = await getTodayMealPlans();
      setMealPlans(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "식단을 불러오지 못했습니다.",
      );
      setMealPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayPlans();
  }, [fetchTodayPlans]);

  useEffect(() => {
    const mealIds = mealPlans.map((p) => p.mealId).filter((v) => v != null);

    if (mealIds.length === 0) {
      setMealItemsByMealId({});
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const pairs = await Promise.all(
          mealIds.map(async (mealId) => {
            const items = await getMealItemsByMealId(mealId);
            return [mealId, Array.isArray(items) ? items : []];
          }),
        );
        if (cancelled) return;
        setMealItemsByMealId(Object.fromEntries(pairs));
      } catch (e) {
        if (cancelled) return;
        setError(
          e.response?.data?.message ||
            e.message ||
            "식단 재료를 불러오지 못했습니다.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mealPlans]);

  const handleRecommend = async () => {
    setRecommendLoading(true);
    setError(null);
    try {
      const res = await replaceTodayRecommendations();
      if (res.comment != null && res.comment !== "") {
        setRecommendComment(res.comment);
      }
      await fetchTodayPlans();
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "추천을 받지 못했습니다.",
      );
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleAccept = async () => {
    setAcceptLoading(true);
    setError(null);
    try {
      await acceptTodayMealPlans();
      window.alert("저장되었습니다.");
      await fetchTodayPlans();
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "저장에 실패했습니다.",
      );
    } finally {
      setAcceptLoading(false);
    }
  };

  const mealsForDisplay = [
    { label: "아침", type: "B" },
    { label: "점심", type: "L" },
    { label: "저녁", type: "D" },
  ].map(({ label, type }) => ({
    label,
    plan: mealPlans.find((p) => p.mealType === type),
  }));

  const safeParseIngredients = (ingredientsRaw) => {
    if (!ingredientsRaw) return [];
    if (Array.isArray(ingredientsRaw)) return ingredientsRaw;
    if (typeof ingredientsRaw !== "string") return [];
    try {
      const parsed = JSON.parse(ingredientsRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return ingredientsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  };

  /** 끼니별 meal_item 목록 (성분 분석 섹션용) */
  const mealItemsByMealLabel = mealsForDisplay.map(({ label, plan }) => {
    const items = plan?.mealId != null ? mealItemsByMealId[plan.mealId] : [];
    const itemList = Array.isArray(items) ? items : [];
    return { label, items: itemList };
  });

  const nutritionRows = mealsForDisplay.map(({ label, plan }) => ({
    label,
    calories: plan?.totalCalories ?? 0,
    carbohydrate: plan?.carbohydrate ?? 0,
    protein: plan?.protein ?? 0,
    fat: plan?.fat ?? 0,
  }));

  const macroTotals = nutritionRows.reduce(
    (acc, r) => ({
      carbohydrate: acc.carbohydrate + (r.carbohydrate || 0),
      protein: acc.protein + (r.protein || 0),
      fat: acc.fat + (r.fat || 0),
    }),
    { carbohydrate: 0, protein: 0, fat: 0 },
  );

  const macroDonutData = {
    labels: ["탄수화물", "단백질", "지방"],
    datasets: [
      {
        data: [macroTotals.carbohydrate, macroTotals.protein, macroTotals.fat],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)", // carb
          "rgba(255, 99, 132, 0.6)", // protein
          "rgba(255, 206, 86, 0.6)", // fat
        ],
        borderColor: "rgba(0, 0, 0, 0)",
        borderWidth: 1,
      },
    ],
  };

  const totalCalories = nutritionRows.reduce(
    (sum, r) => sum + (r.calories || 0),
    0,
  );

  const displayComment =
    recommendComment != null && recommendComment !== ""
      ? recommendComment
      : DEFAULT_COMMENT;
  const todayStr = new Date().toISOString().slice(0, 10);
  const userName = user?.name ?? "";

  return (
    <section className="wrap  ">
      <div className="containers mx-auto text-main-02 text-center">
        {/* 상단 타이틀 */}
        <h3 className="mb-4 text-base md:text-lg lg:text-xl xl:text-2xl">
          <i className="fa-solid fa-utensils mr-2" />
          {userName ? `${userName}님을 위한 AI 식단 추천` : "AI 식단 추천"}
        </h3>
        <hr className="border-t-10 border-main-02 my-6" />
        <h2 className="mb-8 text-lg font-semibold">오늘의 식단</h2>
        <div className="myBg bg-light-02">
          {/* 날짜 배지 */}
          <div className="  flex justify-center mb-10">
            <span className=" mt-[5%] inline-flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-1 rounded-full">
              📅 {todayStr}
            </span>
          </div>

          {error && (
            <p className="text-red-600 text-sm max-w-[520px] mx-auto mb-4">
              {error}
            </p>
          )}

          {/* 식단 카드 영역 */}
          <div className="grid grid-cols-1  lg:grid-cols-3 gap-10 lg:max-w-[1000px] w-[80%] mx-auto mb-10">
            {loading ? (
              <p className="col-span-full text-main-02 text-sm">
                식단을 불러오는 중...
              </p>
            ) : (
              mealsForDisplay.map(({ label, plan }) => (
                <div key={label} className="flex flex-col items-center w-full">
                  <h3 className="mb-3 text-main-02 font-semibold">{label}</h3>
                  <article className="w-full bg-white rounded-xl border border-main-02 p-6 shadow-sm">
                    <div className="flex justify-between gap-2">
                      {plan ? (
                        <div className="flex flex-col items-center bg-white rounded-lg border px-3 py-2 w-full">
                          <div className="text-2xl">🍽️</div>
                          <p className="text-xs mt-1 font-medium">
                            {plan.menu || "(메뉴 없음)"}
                          </p>
                          {plan.totalCalories != null && (
                            <p className="text-xs text-gray-500">
                              {plan.totalCalories}kcal
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center rounded-lg border border-dashed px-3 py-4 w-full text-gray-400 text-sm">
                          추천 받기 버튼을 눌러주세요
                        </div>
                      )}
                    </div>
                  </article>
                </div>
              ))
            )}
          </div>

          {/* 설명 문구 — /meal-plans/recommend/today 응답의 comment 표시 */}
          <p className="text-main-02 text-sm w-[90%] md:w-[70%] lg:w-[40%] mx-auto mb-8">
            {displayComment}
          </p>

          {/* CTA 버튼 */}
          <div className=" mb-[2%] flex flex-col gap-3 items-center ">
            <BtnComp
              size="short"
              variant="primary"
              onClick={handleRecommend}
              disabled={recommendLoading}
              className="!min-w-[250px]"
            >
              {recommendLoading ? "추천 받는 중..." : "오늘의 식단 새로 받기"}
            </BtnComp>
            <BtnComp
              size="short"
              variant="primary"
              onClick={handleAccept}
              disabled={acceptLoading || mealPlans.length === 0}
              className="!min-w-[250px]"
            >
              {acceptLoading ? "저장 중..." : "저장하기"}
            </BtnComp>
          </div>

          {/* 오늘의 식단 성분 분석 — 같은 영역에서 바로 노출 */}
          <section className="pb-[5%] ">
            <section className=" bg-light-02 w-[90%] mx-auto ">
              <h3 className="!mt-[70px] text-base md:text-lg lg:text-xl xl:text-2xl">
                <i className="fa-solid fa-utensils mr-2" />
                오늘의 식단 영양소 분석
              </h3>
              <article className="w-full  max-w-[520px] mx-auto mt-6 rounded-xl border border-main-02 p-6 shadow-sm bg-white">
                <div className="text-left ">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-main-02 border-b">
                          <th className="py-2 pr-2 text-left">식사</th>
                          <th className="py-2 px-2 text-right">칼로리</th>
                          <th className="py-2 px-2 text-right">탄수</th>
                          <th className="py-2 px-2 text-right">단백</th>
                          <th className="py-2 pl-2 text-right">지방</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nutritionRows.map((r) => (
                          <tr
                            key={r.label}
                            className="border-b last:border-b-0"
                          >
                            <td className="py-2 pr-2">{r.label}</td>
                            <td className="py-2 px-2 text-right">
                              {r.calories}kcal
                            </td>
                            <td className="py-2 px-2 text-right">
                              {r.carbohydrate}
                            </td>
                            <td className="py-2 px-2 text-right">
                              {r.protein}
                            </td>
                            <td className="py-2 pl-2 text-right">{r.fat}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className=" pt-7 border-t flex justify-between items-center">
                    <p className="font-semibold text-main-02">총 칼로리</p>
                    <p className="font-semibold text-main-02">
                      {totalCalories}kcal
                    </p>
                  </div>
                </div>
              </article>
            </section>
            <h3 className="mb-4  !mt-[70px] text-base md:text-lg lg:text-xl xl:text-2xl text-main-02 ">
              <i className="fa-solid fa-utensils mr-2" />
              오늘의 식단 정밀 분석
            </h3>
            <article className="w-[90%] mx-auto  max-w-[520px] mx-auto rounded-xl border border-main-02 p-6 shadow-sm bg-white">
              <DonutChart data={macroDonutData} />
              <div className="mt-6 text-left">
                <p className="text-main-02 font-semibold mb-3">
                  식단 항목 · 재료 목록
                </p>
                {mealItemsByMealLabel.every((x) => x.items.length === 0) ? (
                  <p className="text-sm text-gray-500">
                    표시할 식단 항목이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {mealItemsByMealLabel.map(({ label, items }) => (
                      <div key={label}>
                        <p className="text-main-02 font-semibold mb-2">
                          {label}
                        </p>
                        {items.length === 0 ? (
                          <p className="text-sm text-gray-500">항목 없음</p>
                        ) : (
                          <ul className="space-y-3">
                            {items.map((item) => {
                              const ingredients = safeParseIngredients(
                                item.ingredients,
                              );
                              return (
                                <li
                                  key={item.id}
                                  className="rounded-lg border border-main-02/30 p-3 text-sm"
                                >
                                  <p className="font-medium text-main-02">
                                    {item.name}
                                  </p>
                                  <p className="text-gray-600 mt-1">
                                    칼로리 {item.calories ?? 0}kcal · 탄수{" "}
                                    {item.carbohydrate ?? 0}g · 단백{" "}
                                    {item.protein ?? 0}g · 지방 {item.fat ?? 0}g
                                    {item.amount != null &&
                                      item.amount > 0 &&
                                      ` · ${item.amount}g`}
                                  </p>
                                  {ingredients.length > 0 ? (
                                    <>
                                      <p className="text-main-02 font-medium mt-2 mb-1">
                                        재료
                                      </p>
                                      <ul className="list-disc pl-5 text-gray-600">
                                        {ingredients.map((ing, idx) => (
                                          <li key={idx}>{ing}</li>
                                        ))}
                                      </ul>
                                    </>
                                  ) : null}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </section>
        </div>
      </div>
    </section>
  );
}

export default FoodManagement;
