// 운동 기록 테스트 데이터
export const getExerciseRecords = () => {
  // 현재 날짜 기준으로 이번주와 지난주 날짜 생성
  const today = new Date();
  const currentDay = today.getDay(); // 0(일요일) ~ 6(토요일)
  
  // 이번주 월요일 계산
  const thisWeekMonday = new Date(today);
  thisWeekMonday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  
  // 지난주 월요일 계산
  const lastWeekMonday = new Date(thisWeekMonday);
  lastWeekMonday.setDate(thisWeekMonday.getDate() - 7);
  
  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // 이번주 날짜들 (월~일)
  const thisWeekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(thisWeekMonday);
    date.setDate(thisWeekMonday.getDate() + i);
    thisWeekDates.push(formatDate(date));
  }
  
  // 지난주 날짜들 (월~일)
  const lastWeekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(lastWeekMonday);
    date.setDate(lastWeekMonday.getDate() + i);
    lastWeekDates.push(formatDate(date));
  }
  
  return [
    {
      id: 1,
      date: "2025-01-15",
      exercises: {
        코어: [{ name: "플랭크", value: "10분" }],
        유산소: [{ name: "걷기", value: "30분" }],
        근력: [{ name: "웨이트 트레이닝", value: "20분" }],
        "종합/HIT": [{ name: "버피테스트", value: "15분" }],
      },
      totalCalories: 520,
    },
    {
      id: 2,
      date: "2025-01-14",
      exercises: {
        유산소: [
          { name: "달리기", value: "25분" },
          { name: "줄넘기", value: "15분" },
        ],
        근력: [{ name: "푸시업/런지", value: "20분" }],
        유연성: [{ name: "요가/스트레칭", value: "15분" }],
      },
      totalCalories: 480,
    },
    {
      id: 3,
      date: "2025-01-13",
      exercises: {
        코어: [{ name: "플랭크", value: "12분" }],
        유산소: [{ name: "자전거타기", value: "40분" }],
        "종합/HIT": [{ name: "계단 오르기", value: "20분" }],
      },
      totalCalories: 550,
    },
    {
      id: 4,
      date: "2025-01-12",
      exercises: {
        근력: [
          { name: "웨이트 트레이닝", value: "30분" },
          { name: "푸시업/런지", value: "15분" },
        ],
        유연성: [{ name: "요가/스트레칭", value: "20분" }],
      },
      totalCalories: 420,
    },
    {
      id: 5,
      date: "2025-01-11",
      exercises: {
        코어: [{ name: "플랭크", value: "15분" }],
        유산소: [{ name: "걷기", value: "45분" }],
        "종합/HIT": [
          { name: "버피테스트", value: "20분" },
          { name: "계단 오르기", value: "15분" },
        ],
      },
      totalCalories: 600,
    },
    {
      id: 6,
      date: "2025-01-10",
      exercises: {
        유산소: [{ name: "달리기", value: "35분" }],
        근력: [{ name: "웨이트 트레이닝", value: "25분" }],
        유연성: [{ name: "요가/스트레칭", value: "10분" }],
      },
      totalCalories: 510,
    },
    {
      id: 7,
      date: "2025-01-09",
      exercises: {
        코어: [{ name: "플랭크", value: "8분" }],
        유산소: [
          { name: "자전거타기", value: "30분" },
          { name: "줄넘기", value: "20분" },
        ],
        근력: [{ name: "푸시업/런지", value: "18분" }],
      },
      totalCalories: 580,
    },
    {
      id: 8,
      date: "2025-01-08",
      exercises: {
        유산소: [{ name: "걷기", value: "50분" }],
        유연성: [{ name: "요가/스트레칭", value: "25분" }],
        "종합/HIT": [{ name: "계단 오르기", value: "25분" }],
      },
      totalCalories: 450,
    },
    {
      id: 9,
      date: "2025-01-07",
      exercises: {
        코어: [{ name: "플랭크", value: "12분" }],
        근력: [{ name: "웨이트 트레이닝", value: "35분" }],
        "종합/HIT": [{ name: "버피테스트", value: "25분" }],
      },
      totalCalories: 620,
    },
    {
      id: 10,
      date: "2025-01-06",
      exercises: {
        유산소: [{ name: "달리기", value: "40분" }],
        근력: [{ name: "푸시업/런지", value: "20분" }],
        유연성: [{ name: "요가/스트레칭", value: "15분" }],
      },
      totalCalories: 540,
    },
    {
      id: 11,
      date: "2025-01-05",
      exercises: {
        코어: [{ name: "플랭크", value: "10분" }],
        유산소: [{ name: "자전거타기", value: "35분" }],
        "종합/HIT": [
          { name: "버피테스트", value: "15분" },
          { name: "계단 오르기", value: "20분" },
        ],
      },
      totalCalories: 590,
    },
    {
      id: 12,
      date: "2025-01-04",
      exercises: {
        유산소: [{ name: "줄넘기", value: "30분" }],
        근력: [
          { name: "웨이트 트레이닝", value: "20분" },
          { name: "푸시업/런지", value: "15분" },
        ],
        유연성: [{ name: "요가/스트레칭", value: "20분" }],
      },
      totalCalories: 500,
    },
    {
      id: 13,
      date: "2025-01-03",
      exercises: {
        코어: [{ name: "플랭크", value: "15분" }],
        유산소: [{ name: "걷기", value: "40분" }],
        "종합/HIT": [{ name: "계단 오르기", value: "30분" }],
      },
      totalCalories: 480,
    },
    {
      id: 14,
      date: "2025-01-02",
      exercises: {
        유산소: [{ name: "달리기", value: "30분" }],
        근력: [{ name: "웨이트 트레이닝", value: "30분" }],
        유연성: [{ name: "요가/스트레칭", value: "25분" }],
      },
      totalCalories: 560,
    },
    {
      id: 15,
      date: "2025-01-01",
      exercises: {
        코어: [{ name: "플랭크", value: "12분" }],
        유산소: [
          { name: "자전거타기", value: "45분" },
          { name: "줄넘기", value: "15분" },
        ],
        "종합/HIT": [{ name: "버피테스트", value: "20분" }],
      },
      totalCalories: 610,
    },
    {
      id: 16,
      date: "2024-12-31",
      exercises: {
        근력: [{ name: "푸시업/런지", value: "25분" }],
        유연성: [{ name: "요가/스트레칭", value: "30분" }],
        "종합/HIT": [{ name: "계단 오르기", value: "20분" }],
      },
      totalCalories: 380,
    },
    // 이번주 데이터 (월~일)
    {
      id: 17,
      date: thisWeekDates[0], // 월요일
      exercises: {
        코어: [{ name: "플랭크", value: "12분" }],
        유산소: [{ name: "걷기", value: "35분" }],
        근력: [{ name: "웨이트 트레이닝", value: "25분" }],
      },
      totalCalories: 520,
    },
    {
      id: 18,
      date: thisWeekDates[1], // 화요일
      exercises: {
        유산소: [{ name: "달리기", value: "30분" }],
        근력: [{ name: "푸시업/런지", value: "20분" }],
        유연성: [{ name: "요가/스트레칭", value: "15분" }],
      },
      totalCalories: 480,
    },
    {
      id: 19,
      date: thisWeekDates[2], // 수요일
      exercises: {
        코어: [{ name: "플랭크", value: "10분" }],
        유산소: [{ name: "자전거타기", value: "40분" }],
        "종합/HIT": [{ name: "버피테스트", value: "20분" }],
      },
      totalCalories: 550,
    },
    {
      id: 20,
      date: thisWeekDates[3], // 목요일
      exercises: {
        근력: [
          { name: "웨이트 트레이닝", value: "30분" },
          { name: "푸시업/런지", value: "15분" },
        ],
        유연성: [{ name: "요가/스트레칭", value: "20분" }],
      },
      totalCalories: 450,
    },
    {
      id: 21,
      date: thisWeekDates[4], // 금요일
      exercises: {
        코어: [{ name: "플랭크", value: "15분" }],
        유산소: [{ name: "걷기", value: "45분" }],
        "종합/HIT": [{ name: "계단 오르기", value: "25분" }],
      },
      totalCalories: 600,
    },
    {
      id: 22,
      date: thisWeekDates[5], // 토요일
      exercises: {
        유산소: [{ name: "달리기", value: "35분" }],
        근력: [{ name: "웨이트 트레이닝", value: "25분" }],
        유연성: [{ name: "요가/스트레칭", value: "10분" }],
      },
      totalCalories: 510,
    },
    {
      id: 23,
      date: thisWeekDates[6], // 일요일
      exercises: {
        코어: [{ name: "플랭크", value: "8분" }],
        유산소: [
          { name: "자전거타기", value: "30분" },
          { name: "줄넘기", value: "20분" },
        ],
        근력: [{ name: "푸시업/런지", value: "18분" }],
      },
      totalCalories: 580,
    },
    // 지난주 데이터 (월~일)
    {
      id: 24,
      date: lastWeekDates[0], // 월요일
      exercises: {
        유산소: [{ name: "걷기", value: "50분" }],
        유연성: [{ name: "요가/스트레칭", value: "25분" }],
        "종합/HIT": [{ name: "계단 오르기", value: "25분" }],
      },
      totalCalories: 450,
    },
    {
      id: 25,
      date: lastWeekDates[1], // 화요일
      exercises: {
        코어: [{ name: "플랭크", value: "12분" }],
        근력: [{ name: "웨이트 트레이닝", value: "35분" }],
        "종합/HIT": [{ name: "버피테스트", value: "25분" }],
      },
      totalCalories: 620,
    },
    {
      id: 26,
      date: lastWeekDates[2], // 수요일
      exercises: {
        유산소: [{ name: "달리기", value: "40분" }],
        근력: [{ name: "푸시업/런지", value: "20분" }],
        유연성: [{ name: "요가/스트레칭", value: "15분" }],
      },
      totalCalories: 540,
    },
    {
      id: 27,
      date: lastWeekDates[3], // 목요일
      exercises: {
        코어: [{ name: "플랭크", value: "10분" }],
        유산소: [{ name: "자전거타기", value: "35분" }],
        "종합/HIT": [
          { name: "버피테스트", value: "15분" },
          { name: "계단 오르기", value: "20분" },
        ],
      },
      totalCalories: 590,
    },
    {
      id: 28,
      date: lastWeekDates[4], // 금요일
      exercises: {
        유산소: [{ name: "줄넘기", value: "30분" }],
        근력: [
          { name: "웨이트 트레이닝", value: "20분" },
          { name: "푸시업/런지", value: "15분" },
        ],
        유연성: [{ name: "요가/스트레칭", value: "20분" }],
      },
      totalCalories: 500,
    },
    {
      id: 29,
      date: lastWeekDates[5], // 토요일
      exercises: {
        코어: [{ name: "플랭크", value: "15분" }],
        유산소: [{ name: "걷기", value: "40분" }],
        "종합/HIT": [{ name: "계단 오르기", value: "30분" }],
      },
      totalCalories: 480,
    },
    {
      id: 30,
      date: lastWeekDates[6], // 일요일
      exercises: {
        유산소: [{ name: "달리기", value: "30분" }],
        근력: [{ name: "웨이트 트레이닝", value: "30분" }],
        유연성: [{ name: "요가/스트레칭", value: "25분" }],
      },
      totalCalories: 560,
    },
  ];
};
