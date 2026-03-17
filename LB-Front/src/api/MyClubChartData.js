// 클럽별 월별 게시글 작성 수 차트 데이터 생성
export const getMyClubChartData = (myClubs, myBoards) => {
  const now = new Date();
  const months = [];
  
  // 최근 6개월 라벨 생성
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${date.getMonth() + 1}월`);
  }

  // 클럽별 색상 배열
  const colors = [
    { border: '#ff8a9a', background: '#ff8a9a' },
    { border: '#a3d65c', background: '#a3d65c' },
    { border: '#4a90e2', background: '#4a90e2' },
    { border: '#f5a623', background: '#f5a623' },
    { border: '#bd10e0', background: '#bd10e0' },
    { border: '#50e3c2', background: '#50e3c2' },
  ];

  // 각 클럽별로 데이터셋 생성
  const datasets = myClubs.map((club, index) => {
    const counts = new Array(6).fill(0);
    const color = colors[index % colors.length];

    // 해당 클럽의 게시글만 필터링
    const clubBoards = myBoards.filter((board) => board.clubId === club.id);

    // 월별로 카운트
    clubBoards.forEach((board) => {
      if (board.createdAt) {
        const boardDate = new Date(board.createdAt);
        const boardYear = boardDate.getFullYear();
        const boardMonth = boardDate.getMonth();

        // 최근 6개월 범위 내인지 확인
        for (let i = 5; i >= 0; i--) {
          const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          if (boardYear === targetDate.getFullYear() && boardMonth === targetDate.getMonth()) {
            const idx = 5 - i;
            counts[idx]++;
            break;
          }
        }
      }
    });

    return {
      label: club.name,
      data: counts,
      borderColor: color.border,
      backgroundColor: color.background,
      tension: 0.4,
      pointRadius: 7,
      pointHoverRadius: 9,
      pointBorderWidth: 0,
    };
  });

  // 가입한 커뮤니티가 없을 때 빈 그래프를 표시하기 위해 빈 데이터셋 추가
  // Chart.js는 빈 datasets 배열을 가진 차트도 표시할 수 있지만, 
  // 명시적으로 빈 데이터셋을 하나 추가하여 빈 그래프가 확실히 표시되도록 함
  if (datasets.length === 0) {
    datasets.push({
      label: '활동 내역 없음',
      data: new Array(6).fill(0),
      borderColor: '#e0e0e0',
      backgroundColor: '#e0e0e0',
      tension: 0.4,
      pointRadius: 7,
      pointHoverRadius: 9,
      pointBorderWidth: 0,
    });
  }

  return {
    labels: months,
    datasets: datasets,
  };
};
