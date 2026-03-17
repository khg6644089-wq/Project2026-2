import { useMemo, useState, useEffect } from 'react';
import { Route, Routes, Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import FoodHistory from './FoodHistory';
import HealthHistory from './HealthHistory';
import FoodManagement from './FoodManagement';
import MyInfo from './MyInfo';
import WeekHistory from './WeekHistory';
import CMHistory from './CMHistory';
import Food_HistoryWrite from './Food_HistoryWrite';
import MyInfoTitle from './MyInfoTitle';

import Chart from '../../../components/ChartComp';
import {
  getPieChartData2,
  getDonutChartData1,
} from '../../../api/TestChartData';
import { cmChartOptions } from '../../../api/TestChartData';
import { getMyClubChartData } from '../../../api/MyClubChartData';
import { useMyClubStore } from '../../../api/MyClubData';
import { useClubStore } from '../../../api/ClubData';
import { useMyBoardsStore } from '../../../api/MyBoardsData';
import DonutChart from '../../../components/charts/DonutChart';
import {
  WeightChart,
  CmChart,
  getMacroDonutData,
} from '../../../api/TestChartData';
import { getWeekHistoryAll } from '../../../api/WeekHistory';
import { getWorkouts } from '../../../api/Workout';
import { getDietLogsByDate } from '../../../api/DietLogData';
import { getMealItemsByMealId } from '../../../api/MealItemData';
import {
  buildIngredientChartData,
  EMPTY_INGREDIENT_CHART as SHARED_EMPTY_INGREDIENT_CHART,
} from './ingredientChartUtils';

// 재료 필드 파싱 (JSON 배열 또는 쉼표 구분 문자열)

// 식단/재료가 없을 때 차트를 한 덩어리로 보여주기 위한 데이터
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

const EMPTY_INGREDIENT_CHART = {
  labels: ['기록 없음'],
  datasets: [
    {
      data: [1],
      backgroundColor: ['#e5e7eb'],
      borderWidth: 1,
    },
  ],
};

// 마이페이지 메인 화면 컴포넌트
function MyPageMain() {
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = !!user;

  const [weekHistoryData, setWeekHistoryData] = useState([]);
  const [exerciseRecords, setExerciseRecords] = useState([]);
  const [ingredientChartData, setIngredientChartData] = useState(
    SHARED_EMPTY_INGREDIENT_CHART,
  );

  const { myClubs, fetchMyClubs } = useMyClubStore();

  // 전체 클럽 리스트에서 내가 매니저(개설자)인 클럽을 가져오기
  const { clubs, fetchClubs } = useClubStore();

  const { myBoards, fetchMyBoards } = useMyBoardsStore();

  // 주간 체중 기록 API 호출
  useEffect(() => {
    const fetchWeekHistory = async () => {
      try {
        const data = await getWeekHistoryAll();
        setWeekHistoryData(data || []);
      } catch (error) {
        console.error('주간 체중 기록 조회 실패', error);
        setWeekHistoryData([]);
      }
    };
    fetchWeekHistory();
  }, []);

  // 운동 기록 API 호출
  useEffect(() => {
    const fetchExerciseRecords = async () => {
      try {
        const data = await getWorkouts({ page: 0, size: 1000, sort: 'latest' });
        const grouped = {};
        data.content.forEach((item) => {
          const date = new Date(item.dateAt).toISOString().split('T')[0];
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(item);
        });

        const records = Object.entries(grouped).map(([date, items]) => {
          const exerciseMap = {};
          items.forEach((i) => {
            const name = i.exerciseName;
            const duration = Number(i.durationMin) || 0;
            const calories = parseFloat(i.burntCalories) || 0;
            if (!exerciseMap[name]) {
              exerciseMap[name] = {
                exerciseId: i.exerciseId,
                name,
                durationMin: 0,
                burntCalories: 0,
              };
            }
            exerciseMap[name].durationMin += duration;
            exerciseMap[name].burntCalories += calories;
          });
          const exercises = Object.values(exerciseMap);
          const totalCalories = exercises.reduce(
            (sum, ex) => sum + ex.burntCalories,
            0,
          );
          return { date, exercises, totalCalories };
        });

        setExerciseRecords(records);
      } catch (error) {
        console.error(error);
        setExerciseRecords([]);
      }
    };
    fetchExerciseRecords();
  }, []);

  // 마이클럽 데이터 로드
  useEffect(() => {
    const loadMyClubs = async () => {
      try {
        await fetchMyClubs();
      } catch (err) {
        console.error('마이클럽 데이터 로드 실패:', err);
      }
    };
    loadMyClubs();
  }, [fetchMyClubs]);

  // 전체 클럽 리스트 로드 (내가 개설한 커뮤니티 판별용)
  useEffect(() => {
    const loadClubs = async () => {
      try {
        await fetchClubs();
      } catch (err) {
        console.error('클럽 리스트 로드 실패:', err);
      }
    };
    loadClubs();
  }, [fetchClubs]);

  // 내 게시글 데이터 로드
  useEffect(() => {
    const loadMyBoards = async () => {
      try {
        await fetchMyBoards();
      } catch (err) {
        console.error('내 게시글 데이터 로드 실패:', err);
      }
    };
    loadMyBoards();
  }, [fetchMyBoards]);
  const today = new Date();
  const daysFromMonday = (today.getDay() || 7) - 1;
  const thisWeekMonday = new Date(today);
  thisWeekMonday.setDate(today.getDate() - daysFromMonday);
  thisWeekMonday.setHours(0, 0, 0, 0);

  const weeklyCalorieData = useMemo(() => {
    const weekDayLabels = ['월', '화', '수', '목', '금', '토', '일'];

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
          label: '지난주',
          data: lastWeek,
          backgroundColor: '#DFF0FF',
          borderColor: '#A7D6FF',
          borderWidth: 1,
        },
        {
          label: '이번주',
          data: thisWeek,
          backgroundColor: '#D9FFD5',
          borderColor: '#AFE1AA',
          borderWidth: 1,
        },
      ],
    };
  }, [exerciseRecords]);

  // 주간 체중 차트 데이터
  const WeightChartData = useMemo(() => {
    return {
      labels: weekHistoryData.map((item) => item.date),
      datasets: [
        {
          label: '체중(kg)',
          data: weekHistoryData.map((item) => item.weight),
          borderColor: '#4ade80',
          backgroundColor: 'rgba(74, 222, 128, 0.3)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [weekHistoryData]);

  // 내가 매니저(개설자)인 클럽들만 필터링
  const myManagedClubs = useMemo(() => {
    if (!user?.id || !Array.isArray(clubs)) return [];
    return clubs.filter((club) => club.managerId === user.id);
  }, [clubs, user]);

  // 가입한 커뮤니티(myClubs) + 내가 개설한 커뮤니티(myManagedClubs)를 합친 목록 (id 기준 중복 제거)
  const joinedAndManagedClubs = useMemo(() => {
    const map = new Map();
    // 가입한 커뮤니티 우선
    myClubs.forEach((club) => {
      if (club && club.id != null) {
        map.set(club.id, club);
      }
    });
    // 내가 개설한 커뮤니티 추가 (이미 있으면 중복 방지)
    myManagedClubs.forEach((club) => {
      if (club && club.id != null && !map.has(club.id)) {
        map.set(club.id, club);
      }
    });
    return Array.from(map.values());
  }, [myClubs, myManagedClubs]);

  // 커뮤니티 활동 차트 데이터
  const cmChartData = useMemo(() => {
    return getMyClubChartData(joinedAndManagedClubs, myBoards);
  }, [joinedAndManagedClubs, myBoards]);

  // 요일별 운동 칼로리 차트 데이터
  const fetchWorkouts = async () => {
    try {
      const data = await getWorkouts({
        page: 0,
        size: 1000,
        sort,
      });

      const grouped = {};

      data.content.forEach((item) => {
        const date = new Date(item.dateAt).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item);
      });

      const records = Object.entries(grouped).map(([date, items]) => {
        const exerciseMap = {};

        items.forEach((i) => {
          const name = i.exerciseName;
          const duration = Number(i.durationMin) || 0;
          const calories = parseFloat(i.burntCalories) || 0;

          if (!exerciseMap[name]) {
            exerciseMap[name] = {
              exerciseId: i.exerciseId,
              name,
              durationMin: 0,
              burntCalories: 0,
              ids: [],
            };
          }

          exerciseMap[name].durationMin += duration;
          exerciseMap[name].burntCalories += calories;
          exerciseMap[name].ids.push(i.id);
        });

        const exercises = Object.values(exerciseMap);
        const totalCalories = exercises.reduce(
          (sum, ex) => sum + ex.burntCalories,
          0,
        );

        return { date, exercises, totalCalories };
      });

      const sortedRecords = records.sort((a, b) =>
        sort === 'latest'
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
      console.error('운동 기록 조회 실패', error);
    }
  };

  // 오늘 날짜 기준 식단 재료 파이 차트 데이터 (FoodHistory 상단 차트와 동일 로직)
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    let cancelled = false;

    (async () => {
      try {
        const logs = await getDietLogsByDate(todayStr);
        const safeLogs = Array.isArray(logs) ? logs : [];
        const mealIds = [
          ...new Set(
            safeLogs.map((log) => log.mealId).filter((id) => id != null),
          ),
        ];

        if (mealIds.length === 0) {
          if (!cancelled) {
            setIngredientChartData(SHARED_EMPTY_INGREDIENT_CHART);
          }
          return;
        }

        const allItems = await Promise.all(
          mealIds.map((mealId) =>
            getMealItemsByMealId(mealId).then((items) =>
              Array.isArray(items) ? items : [],
            ),
          ),
        );
        if (cancelled) return;

        const flatItems = allItems.flat();
        const countByIngredient = {};
        if (!cancelled) {
          setIngredientChartData(buildIngredientChartData(flatItems));
        }
        return;

        const entries = Object.entries(countByIngredient).sort(
          (a, b) => b[1] - a[1],
        );
        if (entries.length === 0) {
          if (!cancelled) setIngredientChartData(EMPTY_INGREDIENT_CHART);
          return;
        }

        const maxSlices = 10;
        const top = entries.slice(0, maxSlices);
        const rest = entries.slice(maxSlices);
        const restCount = rest.reduce((s, [, n]) => s + n, 0);

        const labels = top.map(([name]) => name);
        const data = top.map(([, n]) => n);
        if (restCount > 0) {
          labels.push('기타');
          data.push(restCount);
        }

        if (!cancelled) {
          setIngredientChartData({
            labels,
            datasets: [
              {
                data,
                backgroundColor: labels.map(
                  (_, i) => PIE_COLORS[i % PIE_COLORS.length],
                ),
                borderWidth: 1,
              },
            ],
          });
        }
      } catch (e) {
        if (!cancelled) {
          setIngredientChartData(SHARED_EMPTY_INGREDIENT_CHART);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="wrap !bg-light-02 !mt-0 md:min-h-[calc(100vh-180px)] flex justify-center items-center">
      <header className="relative w-full h-[300px] overflow-hidden">
        <img
          src="https://ynczwbybtbjftkatmcxg.supabase.co/storage/v1/object/sign/LB/sal.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjY5YTJlMy0zNGQxLTRkNTMtYWYzMC0wOWM5OTZhMzE0ODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9zYWwucG5nIiwiaWF0IjoxNzY5NzU2MjI0LCJleHAiOjE4MDEyOTIyMjR9.3TsRR1yE6Bncxz9AmLaxFi-6DQdqfu-0TE3lhtAvcdo"
          alt="img"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          <h3 className="text-white text-2xl md:text-3xl font-semibold drop-shadow">
            {isLoggedIn ? user?.name + '님을 위한' : ''} 밸런스 체크 공간입니다
            <hr className="my-4 w-full border-t-4 border-main-02" />
          </h3>
          <p className="text-white">
            매일 작은 변화들을 쌓아가며, 건강한 습관을 만들어보세요!
          </p>
          <p className="text-white">
            조금씩달라지는 몸과 마음이 스스로에게 가장 큰 보상이 됩니다.
          </p>
        </div>
      </header>

      <div className="containers">
        <MyInfoTitle />
        <section className="helpme mt-[3%] pb-[10%]">
          <ul className="w-full flex flex-row gap-y-15 justify-between flex-wrap">
            {/* 오늘 식사 기록 */}
            <li className="w-full md:w-[45%] lg:w-[30%]">
              <Link
                to="foodhistory"
                className="flex flex-col justify-center items-center"
              >
                <h4 className="text-deep mb-[3%]">오늘 식사 기록</h4>
                <div className="border border-main-02 w-[100%] h-[100%] overflow-hidden rounded-[20px] flex justify-center items-center bg-white">
                  <div className="w-[70%] m-5">
                    <Chart
                      type="pie"
                      data={ingredientChartData}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  </div>
                </div>
              </Link>
            </li>

            {/* 나의 운동 기록 */}
            <li className="w-full md:w-[45%] lg:w-[30%]">
              <Link
                to="healthhistory"
                className="flex flex-col justify-center items-center"
              >
                <h4 className="text-deep mb-[3%]">나의 운동 기록</h4>
                <div className="border border-main-02 w-[100%] h-[100%] overflow-hidden rounded-[20px] flex justify-center items-center bg-white">
                  <div className="w-[80%] m-5">
                    <Chart
                      type="bar"
                      data={weeklyCalorieData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { title: { display: false } },
                      }}
                    />
                  </div>
                </div>
              </Link>
            </li>

            {/* 주간 체중 기록 */}
            <li className="w-full md:w-[45%] lg:w-[30%]">
              <Link
                to="weekhistory"
                className="flex flex-col justify-center items-center"
              >
                <h4 className="text-deep mb-[3%]">주간 체중 기록</h4>
                <div className="border border-main-02 w-[100%] h-[100%] overflow-hidden rounded-[20px] flex justify-center items-center bg-white">
                  <div className="w-[90%] m-5">
                    <Chart
                      type="line"
                      data={WeightChartData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: { title: { display: false } },
                      }}
                    />
                  </div>
                </div>
              </Link>
            </li>

            {/* 나의 커뮤니티 활동 */}
            <li className="w-full md:w-[45%] lg:w-[30%]">
              <Link
                to="cmhistory"
                className="flex flex-col justify-center items-center"
              >
                <h4 className="text-deep mb-[3%]">나의 커뮤니티 활동</h4>
                <div className="border border-main-02 w-[100%] h-[100%] overflow-hidden rounded-[20px] flex justify-center items-center bg-white">
                  <div className="w-[80%] m-5">
                    <Chart
                      type="line"
                      data={cmChartData}
                      options={cmChartOptions}
                    />
                  </div>
                </div>
              </Link>
            </li>

            {/* 오늘의 식단 추천 */}
            <li className="w-full md:w-[45%] lg:w-[30%]">
              <Link
                to="foodmanagement"
                className="flex flex-col justify-center items-center"
              >
                <h4 className="text-deep mb-[3%]">오늘의 식단 추천</h4>
                <div className="border border-main-02 w-[100%] h-[100%] overflow-hidden rounded-[20px] flex justify-center items-center bg-white">
                  <div className="w-[70%] m-5">
                    <DonutChart data={getMacroDonutData()} />
                  </div>
                </div>
              </Link>
            </li>

            {/* 내정보 수정 */}
            <li className="w-full md:w-[45%] lg:w-[30%]">
              <Link
                to="myinfo"
                className="flex flex-col justify-center items-center"
              >
                <h4 className="text-deep mb-[3%]">내정보 수정</h4>
                <div className="border border-main-02 w-[100%] h-[100%] overflow-hidden rounded-[20px] flex justify-center items-center bg-white">
                  <div className="w-[480px] h-[402px] flex m-5">
                    <img
                      className="h-full object-contain"
                      src="https://tcrvvxreqanojyitggun.supabase.co/storage/v1/object/sign/LB/myinfo_icon.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMmQ3ZWQ0Ni0xYzhjLTQ1NzgtYjAyMC1hYmMxNGQyMTg1ZmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9teWluZm9faWNvbi5wbmciLCJpYXQiOjE3NzAzNjUzODMsImV4cCI6MTgwMTkwMTM4M30.KoyaxRlICl6mfJoSlR9fksEvrxQdeDx067Atcyfy8GQ"
                      alt="img"
                    />
                  </div>
                </div>
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

// 전체 라우팅
function MyPage() {
  return (
    <Routes>
      <Route path="/" element={<MyPageMain />} />
      <Route path="foodhistory" element={<FoodHistory />} />
      <Route path="food_historywrite" element={<Food_HistoryWrite />} />
      <Route path="healthhistory/*" element={<HealthHistory />} />
      <Route path="foodmanagement" element={<FoodManagement />} />
      <Route path="myinfo" element={<MyInfo />} />
      <Route path="weekhistory" element={<WeekHistory />} />
      <Route path="cmhistory" element={<CMHistory />} />
    </Routes>
  );
}

export default MyPage;
