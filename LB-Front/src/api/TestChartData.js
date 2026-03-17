// 오늘의 영양 비율
export const getPieChartData2 = () => {
  return {
    labels: ['단백질', '탄수화물', '식이섬유', '당류', '나트륨'],
    datasets: [
      {
        data: [30, 25, 15, 10, 20],
        backgroundColor: [
          '#d6cdea',
          '#e9b1f7',
          '#fcd0d0',
          '#cdebcf',
          '#f9cd9e',
        ],
        borderWidth: 1,
      },
    ],
  };
};

// 주간 섭취 칼로리
export const getBarChartData1 = () => {
  return {
    labels: [
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
      '일요일',
    ],
    datasets: [
      {
        label: '지난 주',
        data: [500, 520, 800, 230, 860, 720, 120],
        backgroundColor: 'rgba(255, 99, 132, 0.4)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: '이번 주',
        data: [480, 510, 730, 280, 830, 450, 210],
        backgroundColor: 'rgba(153, 102, 255, 0.4)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };
};
// -----------------------------------------------------------------

// Pie 차트 데이터 (각 데이터 포인트마다 다른 색상)
export const getPieChartData = () => {
  return {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Weekly Sales',
        data: [12, 19, 3, 5, 2, 3, 7],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
};

// 두 번째 바 차트 데이터
export const getBarChartData2 = () => {
  return {
    labels: [
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
      '일요일',
    ],
    datasets: [
      {
        data: [1020, 935, 915, 945, , 1025, 1015],
        backgroundColor: 'rgba(177, 239, 102, 0.6)', // #b1ef66
        borderColor: '#b1ef66',
        borderWidth: 1,
      },
    ],
  };
};
export const barChartOptions = {
  plugins: {
    title: {
      display: false, // 👈 "Bar Chart" 제거
    },
    legend: {
      display: false, // 👈 undefined 제거
    },
  },
  scales: {
    y: {
      min: 0,
      max: 2500,
      ticks: {
        stepSize: 500,
      },
    },
  },
};

export const getDonutChartData1 = () => {
  return {
    labels: ['단백질', '지방', '나트륨', '식이섬유', '탄수화물'],
    datasets: [
      {
        data: [20, 35, 15, 45, 30, 25],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: 'rgba(0, 0, 0, 0)',
        borderWidth: 1,
      },
    ],
  };
};

/** 탄수화물/단백질/지방 매크로 도넛 차트용 데이터 (FoodManagement와 동일 구조, 미리보기용 기본값) */
export const getMacroDonutData = () => ({
  labels: ['탄수화물', '단백질', '지방'],
  datasets: [
    {
      data: [40, 30, 30],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
      ],
      borderColor: 'rgba(0, 0, 0, 0)',
      borderWidth: 1,
    },
  ],
});

export const WeightChart = () => {
  return {
    labels: [
      '12월 1주',
      '12월 2주',
      '12월 3주',
      '12월 4주',
      '1월 1주',
      '1월 2주',
      '1월 3주',
    ],
    datasets: [
      {
        label: '체중 변화',
        data: [62.4, 63.2, 63.0, 63.1, 63.3, 63.4, 64.0],
        borderColor: '#a3dc00',
        backgroundColor: '#a3dc00',
        pointBackgroundColor: '#a3dc00',
        pointBorderColor: '#a3dc00',
        tension: 0.3,
        fill: false,
      },
    ],
  };
};

export const CmChart = () => ({
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: '고기 모델',
      data: [5, 35, 28, 20, 15, 10, 30],
      borderColor: '#ff8a9a',
      backgroundColor: '#ff8a9a',
      tension: 0.4,
      pointRadius: 7,
      pointHoverRadius: 9,
      pointBorderWidth: 0,
    },
    {
      label: '건강한 도둑',
      data: [4, 12, 6, 10, 14, 8, 18],
      borderColor: '#a3d65c',
      backgroundColor: '#a3d65c',
      tension: 0.4,
      pointRadius: 7,
      pointHoverRadius: 9,
      pointBorderWidth: 0,
    },
  ],
});
export const cmChartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    // ✅ 제목 제거 (Line Chart 삭제)
    title: {
      display: false,
    },

    // ✅ 범례는 유지
    legend: {
      position: 'top',
      align: 'center',
      labels: {
        usePointStyle: true,
        pointStyle: 'rect',
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
  },

  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 10,
        color: '#999',
      },
      grid: {
        color: 'rgba(0,0,0,0.1)',
      },
    },
    x: {
      ticks: {
        color: '#999',
      },
      grid: {
        display: false,
      },
    },
  },
};
