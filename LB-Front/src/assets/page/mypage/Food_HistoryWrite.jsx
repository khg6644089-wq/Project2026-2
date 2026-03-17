import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BtnComp from "../../../components/BtnComp";
import MealAnal from "../home/MealAnal";
import { getDietLogsByDate, deleteDietLog } from "../../../api/DietLogData";
import {
  getMealItemsByMealId,
  createMealItem,
  deleteMealItem,
  updateMealItem,
} from "../../../api/MealItemData";
import {
  calculateMealCalories,
  createMealWithItems,
} from "../../../api/MealData";
import { uploadSingleFile } from "../../../api/FileUploadData";

const MEAL_TYPE_MAP = [
  { type: "B", value: "breakfast", label: "아침" },
  { type: "L", value: "lunch", label: "점심" },
  { type: "D", value: "dinner", label: "저녁" },
  { type: "S", value: "snack", label: "간식" },
];

// 로컬 타임존 기준 오늘 날짜(yyyy-MM-dd)
function getTodayLocalDateStr() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

function FoodHistoryWrite() {
  const navigate = useNavigate();
  const location = useLocation();

  const editDate = location.state?.editDate || getTodayLocalDateStr();
  const initialMealType = location.state?.mealType;
  const mode = location.state?.mode || "edit"; // 'edit' | 'create'

  const [writeDate, setWriteDate] = useState(editDate);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialMealType) return;
    const entry = MEAL_TYPE_MAP.find((m) => m.type === initialMealType);
    if (entry) {
      setSelectedMealValue(entry.value);
    }
  }, [initialMealType]);

  const handleSave = async () => {
    if (mode === "create") {
      // create 모드: meal + meal_item + diet_log 생성
      setSaving(true);
      setError(null);
      try {
        const mealType = MEAL_TYPE_MAP.find(
          (m) => m.value === selectedMealValue,
        )?.type;
        if (!mealType) throw new Error("식사 구분을 선택해주세요.");
        const items = editItems
          .map((it) => ({
            name: String(it.name ?? "").trim(),
            amount: Number(it.amount ?? 0),
            calories: Number(it.calories ?? 0),
            carbohydrate: Number(it.carbohydrate ?? 0),
            protein: Number(it.protein ?? 0),
            fat: Number(it.fat ?? 0),
          }))
          .filter((it) => it.name.length > 0);
        if (items.length === 0)
          throw new Error("최소 1개 이상의 음식명을 입력해주세요.");
        const invalid = items.find(
          (it) => !Number.isFinite(it.amount) || it.amount < 1,
        );
        if (invalid)
          throw new Error(
            "저장하려면 모든 음식의 섭취량(g)을 1 이상으로 입력해주세요.",
          );

        // 사진이 있으면 먼저 업로드해서 imageFileId를 받아 meal 생성에 연결
        let imageFileId = null;
        if (mealImageFile) {
          const uploaded = await uploadSingleFile(mealImageFile);
          imageFileId = uploaded?.id ?? null;
        }

        await createMealWithItems({
          mealType,
          date: writeDate,
          items,
          imageFileId,
        });

        navigate("../foodhistory", {
          state: { successMessage: "저장되었습니다.", date: writeDate },
        });
      } catch (e) {
        setError(
          e.response?.data?.message || e.message || "저장에 실패했습니다.",
        );
      } finally {
        setSaving(false);
      }
      return;
    }

    // edit 모드: 기존 meal을 수정하지 않고,
    // 현재 editItems로 "새 meal + meal_item + diet_log"를 생성한 뒤
    // 이 날짜의 기존 diet_log만 삭제하는 방식으로 분리 저장
    setSaving(true);
    setError(null);
    try {
      const baseMealType = MEAL_TYPE_MAP.find(
        (m) => m.value === selectedMealValue,
      )?.type;
      if (!baseMealType) {
        navigate("../foodhistory", { state: { date: editDate } });
        return;
      }

      const items = editItems
        .map((it) => ({
          name: String(it.name ?? "").trim(),
          amount: Number(it.amount ?? 0),
          calories: Number(it.calories ?? 0),
          carbohydrate: Number(it.carbohydrate ?? 0),
          protein: Number(it.protein ?? 0),
          fat: Number(it.fat ?? 0),
        }))
        .filter((it) => it.name.length > 0);
      if (items.length === 0)
        throw new Error("최소 1개 이상의 음식명을 입력해주세요.");
      const invalid = items.find(
        (it) => !Number.isFinite(it.amount) || it.amount < 1,
      );
      if (invalid)
        throw new Error(
          "저장하려면 모든 음식의 섭취량(g)을 1 이상으로 입력해주세요.",
        );

      // 사진이 있으면 새 파일 업로드, 없으면 기존 imageFileId를 그대로 사용
      let imageFileId = currentMeal?.imageFileId ?? null;
      if (mealImageFile) {
        const uploaded = await uploadSingleFile(mealImageFile);
        imageFileId = uploaded?.id ?? null;
      }

      // 새 meal + meal_item + diet_log 생성 (이 날짜 전용)
      await createMealWithItems({
        mealType: baseMealType,
        date: editDate,
        items,
        imageFileId,
      });

      // 이 날짜에 연결된 기존 diet_log만 삭제 (다른 날짜의 diet_log는 그대로 둠)
      const toDeleteDietLogs = Array.isArray(currentMeal?.dietLogIds)
        ? currentMeal.dietLogIds
        : [];
      if (toDeleteDietLogs.length > 0) {
        await Promise.all(toDeleteDietLogs.map((id) => deleteDietLog(id)));
      }

      navigate("../foodhistory", {
        state: { successMessage: "저장되었습니다.", date: editDate },
      });
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "저장에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

  const [meals, setMeals] = useState([]);
  const [selectedMealValue, setSelectedMealValue] = useState("breakfast");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcMessage, setCalcMessage] = useState(null);
  const [analyzedFoodName, setAnalyzedFoodName] = useState(null);
  const [mealImageData, setMealImageData] = useState(null);
  const [mealImageFile, setMealImageFile] = useState(null);

  // UI 편집용(이름/그램수/계산 결과) 상태: 계산 요청은 이 값을 사용
  const [editItems, setEditItems] = useState([]);
  const prevWriteDateRef = useRef(undefined);
  const createInitDoneRef = useRef(false);
  const nextNewIdRef = useRef(1);
  /** 수정 모드에서 삭제 예정인 항목 id (저장하기 시에만 서버 반영, 취소 시 버림) */
  const deletedIdsRef = useRef(new Set());

  const loadDietForDate = useCallback(async (dateStr) => {
    setLoading(true);
    setError(null);
    try {
      const logs = await getDietLogsByDate(dateStr);
      const list = Array.isArray(logs) ? logs : [];

      // 끼니 타입(B/L/D/S)별로, 여러 mealId를 하나의 "편집용 식단"으로 합치기
      const byType = {};

      list.forEach((log) => {
        if (!log.meal) return;

        const mealType = String(log.meal.mealType);

        // 백엔드가 mealId를 어디에 넣어주었는지에 따라 유연하게 처리
        const rawMealId =
          log.mealId ?? log.meal?.id ?? log.meal?.mealId ?? log.meal?.mealID;

        const mealId = Number(rawMealId);
        if (!Number.isFinite(mealId)) return;

        const imageFileId =
          log.meal?.imageFileId ?? log.meal?.image_file_id ?? null;

        if (!byType[mealType]) {
          byType[mealType] = {
            mealType,
            mealId, // 대표 mealId (첫 번째)
            menu: log.meal.menu || "",
            totalCalories: log.meal.totalCalories ?? 0,
            items: [],
            imageFileId,
            dietLogIds: [log.id],
            _mealIds: [mealId],
          };
        } else {
          byType[mealType].totalCalories += log.meal.totalCalories ?? 0;
          byType[mealType].dietLogIds.push(log.id);
          if (!byType[mealType].imageFileId && imageFileId) {
            byType[mealType].imageFileId = imageFileId;
          }
          if (!byType[mealType]._mealIds.includes(mealId)) {
            byType[mealType]._mealIds.push(mealId);
          }
        }
      });

      // 각 끼니 타입별로, 연결된 모든 mealId의 meal_item을 합쳐서 하나의 items 배열로 구성
      const allMealIds = Array.from(
        new Set(Object.values(byType).flatMap((m) => m._mealIds || [])),
      );

      const itemsByMealId = {};
      await Promise.all(
        allMealIds.map(async (id) => {
          const items = await getMealItemsByMealId(Number(id));
          itemsByMealId[id] = Array.isArray(items) ? items : [];
        }),
      );

      const mealList = Object.values(byType).map((m) => ({
        mealType: m.mealType,
        mealId: m.mealId,
        menu: m.menu,
        totalCalories: m.totalCalories,
        imageFileId: m.imageFileId,
        dietLogIds: m.dietLogIds,
        items: (m._mealIds || []).flatMap((id) => itemsByMealId[id] || []),
      }));

      setMeals(mealList);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "식단을 불러오지 못했습니다.",
      );
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mode === "edit") {
      createInitDoneRef.current = false;
      loadDietForDate(editDate);
      return;
    }
    // create 모드: 빈 끼니 4개를 준비해 탭을 모두 활성화
    setMeals(
      MEAL_TYPE_MAP.map((m) => ({
        mealType: m.type,
        mealId: null,
        menu: "",
        totalCalories: 0,
        items: [],
      })),
    );
    setLoading(false);
    setError(null);
    setCalcMessage(null);
    setMealImageData(null);
    // create 모드에서 editItems는 한 번만 초기화 (식단 항목 추가 후 입력이 사라지지 않도록)
    if (!createInitDoneRef.current) {
      createInitDoneRef.current = true;
      nextNewIdRef.current = 1;
      setEditItems([
        {
          id: "new-1",
          name: "",
          amount: 0,
          calories: 0,
          carbohydrate: 0,
          protein: 0,
          fat: 0,
        },
      ]);
    }
  }, [editDate, loadDietForDate, mode]);

  // create 모드에서 날짜를 바꿀 때만 이전 입력/사진 초기화 (마운트 시에는 초기화하지 않음)
  useEffect(() => {
    if (mode !== "create") return;
    const prev = prevWriteDateRef.current;
    prevWriteDateRef.current = writeDate;
    if (prev !== undefined && prev !== writeDate) {
      createInitDoneRef.current = false;
      nextNewIdRef.current = 1;
      setMealImageData(null);
      setEditItems([
        {
          id: "new-1",
          name: "",
          amount: 0,
          calories: 0,
          carbohydrate: 0,
          protein: 0,
          fat: 0,
        },
      ]);
    }
  }, [writeDate, mode]);

  const currentMeal = meals.find((m) => {
    const entry = MEAL_TYPE_MAP.find((me) => me.type === m.mealType);
    return entry && entry.value === selectedMealValue;
  });
  const currentItems = currentMeal ? currentMeal.items : [];

  useEffect(() => {
    setCalcMessage(null);
    if (mode !== "edit") return;
    deletedIdsRef.current = new Set();
    setEditItems(
      currentItems.map((it) => ({
        id: it.id,
        name: it.name ?? "",
        amount: it.amount ?? 0,
        calories: it.calories ?? 0,
        carbohydrate: it.carbohydrate ?? 0,
        protein: it.protein ?? 0,
        fat: it.fat ?? 0,
      })),
    );
  }, [currentMeal?.mealId, currentItems, mode]);

  const refetchCurrentMealItems = useCallback(async () => {
    if (!currentMeal?.mealId) return;
    try {
      const items = await getMealItemsByMealId(currentMeal.mealId);
      setMeals((prev) =>
        prev.map((m) =>
          m.mealId === currentMeal.mealId
            ? { ...m, items: Array.isArray(items) ? items : [] }
            : m,
        ),
      );
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "목록을 갱신하지 못했습니다.",
      );
    }
  }, [currentMeal?.mealId]);

  const handleAddItem = async () => {
    if (mode === "create") {
      nextNewIdRef.current += 1;
      const newId = `new-${nextNewIdRef.current}`;
      setEditItems((prev) => [
        ...prev,
        {
          id: newId,
          name: "",
          amount: 0,
          calories: 0,
          carbohydrate: 0,
          protein: 0,
          fat: 0,
        },
      ]);
      return;
    }
    if (!currentMeal?.mealId) return;
    setEditItems((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: "새 음식",
        amount: 0,
        calories: 0,
        carbohydrate: 0,
        protein: 0,
        fat: 0,
      },
    ]);
  };

  const handleRemoveItem = async (itemId) => {
    if (mode === "create") {
      setEditItems((prev) => prev.filter((it) => it.id !== itemId));
      return;
    }
    const isServerId =
      typeof itemId === "number" ||
      (typeof itemId === "string" &&
        !itemId.startsWith("temp-") &&
        !itemId.startsWith("analyze-"));
    if (isServerId) deletedIdsRef.current.add(itemId);
    setEditItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const handleEditItemChange = (itemId, field, value) => {
    setEditItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, [field]: value } : it)),
    );
  };

  const handleCalculate = async () => {
    if (mode === "edit" && !currentMeal?.mealId) return;
    setCalcLoading(true);
    setError(null);
    setCalcMessage(null);

    try {
      const payloadItems = editItems
        .map((it) => ({
          id: it.id,
          name: String(it.name ?? "").trim(),
          amount_grams: Number(it.amount ?? 0),
        }))
        .filter((it) => it.name.length > 0);

      const invalid = payloadItems.find(
        (it) => !Number.isFinite(it.amount_grams) || it.amount_grams < 1,
      );
      if (invalid) {
        throw new Error(
          "계산하려면 모든 음식의 섭취량(g)을 1 이상으로 입력해주세요.",
        );
      }

      const res = await calculateMealCalories({
        items: payloadItems.map(({ name, amount_grams }) => ({
          name,
          amount_grams,
        })),
      });

      if (mode === "edit") {
        // edit 모드에서는 "계산"을 눌렀을 때 서버를 즉시 수정하지 않습니다.
        // (같은 meal을 다른 날짜가 참조하는 경우가 있어, 저장 전 변경이 다른 날짜에도 보일 수 있음)
        setEditItems((prev) =>
          prev.map((it) => {
            const idx = payloadItems.findIndex((p) => p.id === it.id);
            if (idx < 0 || !Array.isArray(res?.items) || !res.items[idx])
              return it;
            const r = res.items[idx];
            return {
              ...it,
              calories: r?.estimated_calories ?? it.calories ?? 0,
              carbohydrate:
                r?.nutrients?.carbohydrates != null
                  ? Math.round(r.nutrients.carbohydrates)
                  : (it.carbohydrate ?? 0),
              protein:
                r?.nutrients?.protein != null
                  ? Math.round(r.nutrients.protein)
                  : (it.protein ?? 0),
              fat:
                r?.nutrients?.fat != null
                  ? Math.round(r.nutrients.fat)
                  : (it.fat ?? 0),
            };
          }),
        );
        setCalcMessage(`계산 완료: 총 ${res?.total_calories ?? 0} kcal`);
        return;
      }

      // create 모드: 로컬 editItems에 계산 결과 저장
      if (Array.isArray(res?.items)) {
        setEditItems((prev) =>
          prev.map((it) => {
            const idx = payloadItems.findIndex((p) => p.id === it.id);
            if (idx < 0) return it;
            const r = res.items[idx];
            return {
              ...it,
              calories: r?.estimated_calories ?? 0,
              carbohydrate:
                r?.nutrients?.carbohydrates != null
                  ? Math.round(r.nutrients.carbohydrates)
                  : 0,
              protein:
                r?.nutrients?.protein != null
                  ? Math.round(r.nutrients.protein)
                  : 0,
              fat: r?.nutrients?.fat != null ? Math.round(r.nutrients.fat) : 0,
            };
          }),
        );
      }
      setCalcMessage(`계산 완료: 총 ${res?.total_calories ?? 0} kcal`);
    } catch (e) {
      const message =
        e.response?.data?.message || e.message || "계산에 실패했습니다.";
      setError(message);
      window.alert(message);
    } finally {
      setCalcLoading(false);
    }
  };

  const totalKcal =
    mode === "edit"
      ? editItems.reduce((sum, it) => sum + (it.calories ?? 0), 0)
      : currentMeal
        ? currentItems.reduce((sum, it) => sum + (it.calories ?? 0), 0)
        : 0;

  return (
    <div className="bg-light-02">
      <div className="containers mx-auto w-full px-6 py-8 text-deep text-center rounded-2xl">
        <header className="mb-10">
          <span className="mt-[10%] inline-block bg-main-02 text-white text-xs px-3 py-1 rounded-full mb-2">
            식사 기록 수정
          </span>
          <h3 className="text-main-02 flex justify-center items-center gap-2 text-lg md:text-xl lg:text-2xl">
            <i className="fa-solid fa-utensils" />
            {mode === "create" ? "식사 기록 작성" : "저장한 식단 수정"}
          </h3>
          <div className="text-sm text-gray-600 mt-2 flex justify-center items-center gap-2">
            <span>날짜:</span>
            <input
              type="date"
              value={writeDate}
              onChange={(e) => setWriteDate(e.target.value)}
              className="bg-white border rounded px-2 py-1"
              disabled={mode === "edit"}
            />
            <span className="text-xs">
              {mode === "create" ? "(작성 모드)" : "(수정 모드)"}
            </span>
          </div>
          <hr className="border-t-12 border-main-02 my-6" />
        </header>

        {/* 1. 사진 분석 항상 최상단 */}
        <section className="mb-10">
          <h4 className="text-center font-semibold text-main-02 mb-3">
            사진으로 칼로리 분석
          </h4>
          <div className="flex justify-center">
            <MealAnal
              containerClassName="w-full max-w-[520px] flex flex-col justify-center items-center"
              titleClassName="!text-base md:!text-lg lg:!text-xl xl:!text-2xl text-main-02"
              resultTextClassName="text-deep"
              showResult={false}
              onImageChange={(dataUrl) => setMealImageData(dataUrl)}
              onFileSelected={(file) => {
                setMealImageFile(file);
                setAnalyzedFoodName(null);
                setCalcMessage(null);
              }}
              onAnalyzeSuccess={async (data) => {
                const analyzedItems = Array.isArray(data?.items)
                  ? data.items
                  : [];
                const nextName = String(data?.food_name ?? "").trim();
                const totalCaloriesFromResponse = Number(data?.calories ?? 0);
                const totalCaloriesFromItems = analyzedItems.reduce(
                  (sum, item) => sum + (Number(item?.calories ?? 0) || 0),
                  0,
                );
                const totalCalories =
                  Number.isFinite(totalCaloriesFromResponse) &&
                  totalCaloriesFromResponse > 0
                    ? totalCaloriesFromResponse
                    : totalCaloriesFromItems;

                const nutrients = data?.nutrients || {};
                const totalCarbs = Number(nutrients?.carbohydrates ?? 0) || 0;
                const totalProtein = Number(nutrients?.protein ?? 0) || 0;
                const totalFat = Number(nutrients?.fat ?? 0) || 0;

                const now = Date.now();
                const mappedItems =
                  analyzedItems.length > 0
                    ? analyzedItems.map((item, index) => {
                        const rawName = String(item?.name ?? "").trim();
                        const weightGram = Number(item?.weight_gram ?? 0);
                        const itemCaloriesRaw = Number(item?.calories ?? 0);
                        const itemCalories =
                          Number.isFinite(itemCaloriesRaw) &&
                          itemCaloriesRaw > 0
                            ? itemCaloriesRaw
                            : 0;

                        const ratio =
                          totalCalories > 0 && itemCalories > 0
                            ? itemCalories / totalCalories
                            : 0;

                        const carb = Math.round(totalCarbs * ratio);
                        const protein = Math.round(totalProtein * ratio);
                        const fat = Math.round(totalFat * ratio);

                        return {
                          id: `analyze-${now}-${index}`,
                          name: rawName || nextName || "분석 음식",
                          amount: weightGram > 0 ? weightGram : 1,
                          calories: itemCalories,
                          carbohydrate: carb > 0 ? carb : 0,
                          protein: protein > 0 ? protein : 0,
                          fat: fat > 0 ? fat : 0,
                        };
                      })
                    : [
                        {
                          id: `analyze-${now}-0`,
                          name: nextName || "분석 음식",
                          amount: 1,
                          calories:
                            Number.isFinite(totalCaloriesFromResponse) &&
                            totalCaloriesFromResponse > 0
                              ? totalCaloriesFromResponse
                              : 0,
                          carbohydrate: Math.round(totalCarbs) || 0,
                          protein: Math.round(totalProtein) || 0,
                          fat: Math.round(totalFat) || 0,
                        },
                      ];

                // 사진으로 입력하면 기존 MealItem을 지우고 분석 결과만 남김
                setEditItems(mappedItems);

                // 분석 결과 식단 이름 표시
                if (data?.food_name) {
                  setAnalyzedFoodName(data.food_name);
                }

                // 분석 결과 평가 표시
                if (data?.evaluation) {
                  setCalcMessage(data.evaluation);
                }
              }}
            />
          </div>
        </section>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {analyzedFoodName && (
          <p className="text-main-02 !text-xl !font-bold mb-2 text-center font-semibold">
            {analyzedFoodName}
          </p>
        )}
        {calcMessage && (
          <p className="text-green-600 text-sm mb-4 w-full xs:w-[50%] lg:w-[30%] mx-auto">
            {calcMessage}
          </p>
        )}
        {saving && <p className="text-main-02 text-sm mb-4">저장 중...</p>}

        {loading ? (
          <p className="text-main-02">식단을 불러오는 중...</p>
        ) : mode === "edit" && meals.length === 0 ? (
          <p className="text-gray-500 mb-6">
            해당 날짜에 저장된 식단이 없습니다. 식단 관리에서 추천 받고 저장한
            뒤 식사 기록에서 수정할 수 있습니다.
          </p>
        ) : (
          <>
            <section className="mb-8 mt-8">
              <h3 className="font-semibold mb-3">식사 구분</h3>
              <div className="w-full max-w-[500px] mx-auto flex justify-center gap-6 flex-wrap">
                {MEAL_TYPE_MAP.map((item) => {
                  const hasMeal =
                    mode === "create"
                      ? true
                      : meals.some((m) => m.mealType === item.type);
                  const active = selectedMealValue === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSelectedMealValue(item.value)}
                      disabled={!hasMeal}
                      className="flex items-center gap-2 disabled:opacity-50"
                    >
                      <i
                        className={`fa-solid ${
                          active
                            ? "fa-circle-dot text-green-500"
                            : "fa-circle text-white border border-main-02 rounded-full"
                        } text-xl`}
                      />
                      <span
                        className={`text-sm ${
                          active
                            ? "text-green-600 font-semibold"
                            : "text-gray-500"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {(mode === "create" || currentMeal) && (
              <div className="mb-4 p-4 bg-white rounded-xl border border-main-02 max-w-[500px] mx-auto text-left">
                <p className="font-semibold text-main-02">
                  {
                    MEAL_TYPE_MAP.find((m) => m.value === selectedMealValue)
                      ?.label
                  }
                  {analyzedFoodName
                    ? ` — ${analyzedFoodName}`
                    : mode === "edit" && currentMeal
                      ? ` — ${currentMeal.menu || "(메뉴명 없음)"}`
                      : ""}
                </p>
                <p className="text-sm text-gray-600">
                  끼니 합계:{" "}
                  {editItems.reduce(
                    (sum, it) => sum + (Number(it.calories) || 0),
                    0,
                  )}{" "}
                  kcal
                </p>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-center font-semibold text-main-02 mb-2">
                식단 설명 (MealItem)
              </h4>
              <div className="w-full max-w-[500px] mx-auto space-y-2">
                {mode === "create" ? (
                  editItems.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      항목이 없습니다. 아래에서 추가하세요.
                    </p>
                  ) : (
                    editItems.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center bg-white gap-2 border rounded px-3 py-2"
                      >
                        <div className="flex-1 text-left">
                          <div className="flex gap-2 items-center">
                            <input
                              className="flex-1 w-[70%] min-w-[100px] md:max-w-none border rounded px-2 py-1 text-sm"
                              value={it.name ?? ""}
                              onChange={(e) =>
                                handleEditItemChange(
                                  it.id,
                                  "name",
                                  e.target.value,
                                )
                              }
                            />
                            <>
                              <input
                                className="flex max-w-[100px] border rounded px-2 py-1 text-sm text-right"
                                type="number"
                                min={0}
                                value={it.amount ?? 0}
                                onChange={(e) =>
                                  handleEditItemChange(
                                    it.id,
                                    "amount",
                                    e.target.value,
                                  )
                                }
                              />
                              <span className="text-xs text-gray-500">g</span>
                            </>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {it.calories ?? 0} kcal · 탄수{" "}
                            {it.carbohydrate ?? 0} · 단백 {it.protein ?? 0} ·
                            지방 {it.fat ?? 0}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="!w-[80px] h-10 bg-red-500 text-white rounded text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    ))
                  )
                ) : currentMeal ? (
                  editItems.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      등록된 항목이 없습니다. 아래에서 추가하세요.
                    </p>
                  ) : (
                    editItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center bg-white gap-2 border rounded px-3 py-2"
                      >
                        <div className="flex-1 text-left">
                          <div className="flex gap-2 items-center">
                            <input
                              className="max-w-[120px] md:max-w-none border rounded px-2 py-1 text-sm "
                              value={
                                editItems.find((x) => x.id === item.id)?.name ??
                                item.name ??
                                ""
                              }
                              onChange={(e) =>
                                handleEditItemChange(
                                  item.id,
                                  "name",
                                  e.target.value,
                                )
                              }
                            />
                            <input
                              className="max-w-[120px] xs:max-w-none border rounded px-2 py-1 text-sm text-right"
                              type="number"
                              min={0}
                              value={
                                editItems.find((x) => x.id === item.id)
                                  ?.amount ??
                                item.amount ??
                                0
                              }
                              onChange={(e) =>
                                handleEditItemChange(
                                  item.id,
                                  "amount",
                                  e.target.value,
                                )
                              }
                            />
                            <span className="text-xs text-gray-500">g</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.calories ?? 0} kcal · 탄수{" "}
                            {item.carbohydrate ?? 0} · 단백 {item.protein ?? 0}{" "}
                            · 지방 {item.fat ?? 0}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="!w-[100px] !h-[30px] bg-red-500 text-white rounded text-sm disabled:opacity-50"
                        >
                          삭제
                        </button>
                      </div>
                    ))
                  )
                ) : null}
              </div>
            </div>

            {(mode === "create" || currentMeal) && (
              <div className="flex justify-center mb-6">
                <BtnComp
                  size="short"
                  variant="primary"
                  onClick={handleAddItem}
                  disabled={adding}
                >
                  {adding ? "추가 중..." : "식단 항목 추가"}
                </BtnComp>
              </div>
            )}

            {(mode === "create" || currentMeal) && (
              <>
                <div className="flex justify-center mb-4 gap-3">
                  <BtnComp
                    size="short"
                    variant="primary"
                    onClick={handleCalculate}
                    disabled={calcLoading || editItems.length === 0}
                  >
                    {calcLoading ? "계산 중..." : "계산"}
                  </BtnComp>
                </div>
                <p className="mt-2 text-center text-sm text-gray-600 mb-6">
                  현재 선택한 끼니 항목 합계:{" "}
                  <span className="text-main-02 font-semibold">
                    {mode === "edit"
                      ? totalKcal
                      : editItems.reduce(
                          (sum, it) => sum + (Number(it.calories) || 0),
                          0,
                        )}{" "}
                    kcal
                  </span>
                </p>
              </>
            )}
          </>
        )}

        <div className="flex justify-center mb-[10%] gap-4">
          <BtnComp
            size="short"
            variant="primary"
            onClick={handleSave}
            className="max-w-[200px]"
          >
            저장하기
          </BtnComp>
          <BtnComp
            size="short"
            variant="primary"
            onClick={() => {
              const message = "저장되지 않습니다.\n나가시겠습니까?";
              if (window.confirm(message)) {
                navigate(-1);
              }
            }}
            className="max-w-[200px]"
          >
            취소 (뒤로)
          </BtnComp>
        </div>
      </div>
    </div>
  );
}

export default FoodHistoryWrite;
