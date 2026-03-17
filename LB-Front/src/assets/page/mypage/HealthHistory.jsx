// 기존 import 그대로
import BtnComp from "../../../components/BtnComp";
import { useState, useEffect, useMemo } from "react";
import {
  Link,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom"; // ✅ location 추가
import PageNatation from "./../../../components/PageNatation";
import Chart from "../../../components/ChartComp";
import HealthHistoryWrite from "./HealthHistoryWrite";
import usePaginationStore from "../../../stores/paginationStore";
import { getWorkouts, deleteWorkout } from "../../../api/Workout";

function HealthHistoryMain() {
  const [sort, setSort] = useState("latest");
  // 한 페이지에 8개(4개씩 2줄) 고정
  const [pageSize] = useState(8);
  const [exerciseRecords, setExerciseRecords] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const storeKey = "test-list2";
  const pagination = usePaginationStore((state) => state.paginations[storeKey]);
  const currentPage = pagination?.currentPage ?? 0;
  const setPageSizeStore = usePaginationStore((state) => state.setPageSize);
  const setCurrentPage = usePaginationStore((state) => state.setCurrentPage);

  useEffect(() => {
    setPageSizeStore(storeKey, pageSize);
  }, [pageSize, storeKey, setPageSizeStore]);

  // 전체 가져오고 날짜별 그룹핑
  const fetchWorkouts = async () => {
    try {
      const data = await getWorkouts({
        page: 0,
        size: 1000,
        sort,
      });

      // 날짜 순서 Map으로
      const dateMap = new Map();

      data.content.forEach((item) => {
        const date = new Date(item.dateAt).toISOString().split("T")[0];
        if (!dateMap.has(date)) dateMap.set(date, []);
        dateMap.get(date).push(item); // 순서 그대로
      });

      const records = Array.from(dateMap.entries()).map(([date, items]) => {
        // ✅ 같은 날짜 안 운동은 createdAt 기준 정렬
        const sortedItems = items.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );

        const exerciseMap = new Map();
        const exercises = [];

        sortedItems.forEach((i) => {
          const name = i.exerciseName;
          const duration = Number(i.durationMin) || 0;
          const calories = parseFloat(i.burntCalories) || 0;

          if (!exerciseMap.has(name)) {
            const ex = {
              exerciseId: i.exerciseId,
              name,
              durationMin: duration,
              burntCalories: calories,
              ids: [i.id],
            };
            exerciseMap.set(name, ex);
            exercises.push(ex); // 순서 유지
          } else {
            const ex = exerciseMap.get(name);
            ex.durationMin += duration;
            ex.burntCalories += calories;
            ex.ids.push(i.id);
          }
        });

        const totalCalories = exercises.reduce(
          (sum, ex) => sum + ex.burntCalories,
          0,
        );

        return { date, exercises, totalCalories };
      });

      // 날짜 순서만 정렬 (exercises 배열 순서는 그대로)
      const sortedRecords = records.sort((a, b) =>
        sort === "latest"
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date),
      );

      setExerciseRecords(sortedRecords);
      setTotalElements(sortedRecords.length);

      const maxPage = Math.ceil(sortedRecords.length / pageSize) - 1;
      if (currentPage > maxPage && maxPage >= 0) {
        setCurrentPage(storeKey, maxPage);
      }
    } catch (error) {
      console.error("운동 기록 조회 실패", error);
    }
  };

  // 수정 후 돌아오면 무조건 재조회
  useEffect(() => {
    fetchWorkouts();
  }, [sort, pageSize, location.pathname]);

  // 프론트 페이지 처리
  const pagedRecords = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return exerciseRecords.slice(start, end);
  }, [exerciseRecords, currentPage, pageSize]);

  // 삭제
  const handleDelete = async (record) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const allIds = record.exercises.flatMap((ex) => ex.ids);
      await Promise.all(allIds.map((id) => deleteWorkout(id)));
      alert("해당 날짜의 운동 기록이 삭제되었습니다.");
      fetchWorkouts();
    } catch (error) {
      console.error("삭제 실패", error);
      alert("삭제에 실패했습니다.");
    }
  };

  // 수정
  const handleUpdate = (record) => {
    navigate("/mypage/healthhistory/healthhistoywrite", {
      state: { record },
    });
  };

  const today = new Date();
  const daysFromMonday = (today.getDay() || 7) - 1;
  const thisWeekMonday = new Date(today);
  thisWeekMonday.setDate(today.getDate() - daysFromMonday);
  thisWeekMonday.setHours(0, 0, 0, 0);

  const weekStamps = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const dayDate = new Date(thisWeekMonday);
      dayDate.setDate(thisWeekMonday.getDate() + i);
      dayDate.setHours(0, 0, 0, 0);
      const done = exerciseRecords.some((record) => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === dayDate.getTime();
      });
      return { label: ["월", "화", "수", "목", "금", "토", "일"][i], done };
    });
  }, [exerciseRecords]);

  const weeklyCalorieData = useMemo(() => {
    const weekDayLabels = ["월", "화", "수", "목", "금", "토", "일"];

    const sumCaloriesByWeek = (startDate) => {
      const weekCalories = new Array(7).fill(0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      exerciseRecords
        .filter((record) => {
          const recordDate = new Date(record.date);
          return recordDate >= startDate && recordDate <= endDate;
        })
        .forEach((record) => {
          const dayIndex = (new Date(record.date).getDay() || 7) - 1;
          weekCalories[dayIndex] += record.totalCalories;
        });

      return weekCalories.map((c) => Math.round(c));
    };

    const thisWeek = sumCaloriesByWeek(thisWeekMonday);
    const lastWeek = sumCaloriesByWeek(
      new Date(thisWeekMonday.getTime() - 7 * 24 * 60 * 60 * 1000),
    );

    return {
      labels: weekDayLabels,
      datasets: [
        {
          label: "지난주",
          data: lastWeek,
          backgroundColor: "#DFF0FF",
          borderColor: "#A7D6FF",
          borderWidth: 1,
        },
        {
          label: "이번주",
          data: thisWeek,
          backgroundColor: "#D9FFD5",
          borderColor: "#AFE1AA",
          borderWidth: 1,
        },
      ],
    };
  }, [exerciseRecords, thisWeekMonday]);

  return (
    <div className="w-full">
      <div className="containers">
        {/* 제목 */}
        <section className="sect_tit flex items-center justify-center mx-0 mt-[5%] border-b-[5px] border-main-02">
          <h3 className=" !text-main-02 mb-[20px] ">
            <span className="material-icons">directions_run</span>
            나의 운동 기록
          </h3>
        </section>

        <section className="sect01 flex items-center justify-center mt-[20px]">
          <h4 className="tit">
            <span className="material-icons">fitness_center</span>
            오늘은 운동을 하셨나요?
          </h4>
        </section>

        {/* 주간 스탬프 */}
        <section className="w-full max-w-[900px] mx-auto">
          <div className="grid grid-cols-7 bg-white rounded-2xl shadow-md my-[2%] border-1 border-gray-mid">
            {weekStamps.map((day, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center py-6 border-r last:border-r-0 border-gray-mid"
              >
                <span className="text-sm font-semibold text-green-700 mb-[10px]">
                  {day.label}
                </span>
                <img
                  src={
                    day.done
                      ? "https://ynczwbybtbjftkatmcxg.supabase.co/storage/v1/object/sign/LB/ex_s.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjY5YTJlMy0zNGQxLTRkNTMtYWYzMC0wOWM5OTZhMzE0ODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9leF9zLnBuZyIsImlhdCI6MTc3MDEwNDM1NSwiZXhwIjoxODAxNjQwMzU1fQ.qhhg6-X00dSR8Her0jEXPmeRWSIqjEcywfS1qfmcuuo"
                      : "https://ynczwbybtbjftkatmcxg.supabase.co/storage/v1/object/sign/LB/ex_f.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjY5YTJlMy0zNGQxLTRkNTMtYWYzMC0wOWM5OTZhMzE0ODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9leF9mLnBuZyIsImlhdCI6MTc3MDEwNDI4MSwiZXhwIjoxODAxNjQwMjgxfQ.jGc2SXJBtCtNqLfdYSF8yy-bj08VgcPmgmZVqm9S_50"
                  }
                  alt="stamp"
                  className="w-[30px] aspect-square sm:w-[60px]"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 오늘 운동 입력 버튼 */}
        <Link to="../healthhistoywrite">
          <div className="w-full sm:w-[50%] mx-auto flex items-center justify-center mb-[5%]">
            <BtnComp size="mid" variant="primary">
              오늘의 운동 입력하기
            </BtnComp>
          </div>
        </Link>

        {/* 운동 기록 리스트 */}
        <div className="bg-light-02 myBg py-[10%]">
          <section className="containers sect02 flex items-center flex-col justify-center text-gray-deep">
            <h4 className="tit">
              <span className="material-icons">directions_run</span>
              운동 기록 리스트
            </h4>
            <div className="filters w-full flex items-center justify-start sm:justify-end gap-2 mt-4">
              <span className="material-icons !text-[30px]">sort</span>
              <button
                type="button"
                onClick={() => setSort("latest")}
                className={`border rounded-[4px] transition-colors ${
                  sort === "latest"
                    ? "bg-deep text-white border-1 border-deep"
                    : "bg-white hover:bg-light-01"
                }`}
              >
                <p className="px-3 py-1 text-center !text-[14px] md:!text-[18px]">
                  최신순
                </p>
              </button>
              <button
                type="button"
                onClick={() => setSort("oldest")}
                className={`border rounded-[4px] transition-colors ${
                  sort === "oldest"
                    ? "bg-deep text-white border-1 border-deep"
                    : "bg-white hover:bg-light-01"
                }`}
              >
                <p className="px-3 py-1 text-center !text-[14px] md:!text-[18px]">
                  오래된 순
                </p>
              </button>
            </div>

            <div className="hel_list w-full mt-6">
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {pagedRecords.map((record) => (
                  <li
                    key={record.date}
                    className="bg-white border-[0.5px] border-main-02 rounded-lg p-4 md:p-5 flex flex-col gap-4 lg:min-w-[230px]"
                  >
                    <div className="text-base md:text-lg font-semibold text-gray-deep border-b border-gray-light pb-2">
                      {record.date}
                    </div>

                    <div className="flex flex-col gap-3 grow">
                      {record.exercises.map((exercise, idx) => (
                        <div
                          key={idx}
                          className="text-xs md:text-sm text-gray-deep flex items-center"
                        >
                          <span className="mr-1">·</span>
                          <span>
                            {exercise.name} : {exercise.durationMin}분
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-xl md:text-lg font-semibold text-main-02 border-t border-gray-light pt-3">
                      총 소모 칼로리 {Math.round(record.totalCalories)}kcal
                    </div>

                    <div className="flex gap-2 mt-2">
                      <BtnComp
                        variant="primary"
                        size="short"
                        className="!w-[48%] !mt-0 !h-[35px] !text-xs md:!text-sm"
                        onClick={() => handleUpdate(record)}
                      >
                        수정
                      </BtnComp>
                      <BtnComp
                        variant="primary"
                        size="short"
                        className="!w-[48%] !mt-0 !h-[35px] !text-xs md:!text-sm"
                        onClick={() => handleDelete(record)}
                      >
                        삭제
                      </BtnComp>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full mt-[50px]">
              <PageNatation
                storeKey={storeKey}
                totalElements={totalElements}
                pageSize={pageSize}
              />
            </div>
          </section>
        </div>

        {/* 주간 운동 칼로리 비교 차트 */}
        <section className="sect03">
          <div className="min-tit flex flex-row justify-center items-center bg-main-02 w-[200px] mx-auto text-white py-[5px] border rounded-[20px] mt-[5%]">
            <span className="material-icons mr-1.5">calendar_today</span>
            <span>주간 운동 기록 비교</span>
          </div>

          <div className="w-full mt-8 xl:w-[70%] flex justify-center items-center mx-auto mb-[5%]">
            <Chart
              type="bar"
              data={weeklyCalorieData}
              options={{ plugins: { title: { display: false } } }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function HealthHistory() {
  return (
    <Routes>
      <Route path="/" element={<HealthHistoryMain />} />
      <Route path="healthhistoywrite" element={<HealthHistoryWrite />} />
    </Routes>
  );
}

export default HealthHistory;
