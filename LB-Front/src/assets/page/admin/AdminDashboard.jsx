import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Chart from "../../../components/ChartComp";
import {
  getWeeklyNewClubsChartData,
  getFemaleDominantClubsChartData,
  getMaleDominantClubsChartData,
  getAgePopularClubsChartData,
  getTotalStats,
  getTopMemberClubsChartData,
  getWeeklyTopPostClubsChartData,
} from "../../../api/AdminData";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [weeklyClubsData, setWeeklyClubsData] = useState(null);
  const [femaleClubsData, setFemaleClubsData] = useState(null);
  const [maleClubsData, setMaleClubsData] = useState(null);
  const [ageClubsData, setAgeClubsData] = useState(null);
  const [totalStats, setTotalStats] = useState(null);
  const [topMemberClubsData, setTopMemberClubsData] = useState(null);
  const [weeklyTopPostClubsData, setWeeklyTopPostClubsData] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [
          weeklyData,
          femaleData,
          maleData,
          ageData,
          totalData,
          memberData,
          weeklyPostClubsData,
        ] = await Promise.all([
          getWeeklyNewClubsChartData(),
          getFemaleDominantClubsChartData(),
          getMaleDominantClubsChartData(),
          getAgePopularClubsChartData(),
          getTotalStats(),
          getTopMemberClubsChartData(),
          getWeeklyTopPostClubsChartData(),
        ]);

        setWeeklyClubsData(weeklyData);
        setFemaleClubsData(femaleData);
        setMaleClubsData(maleData);
        setAgeClubsData(ageData);
        setTotalStats(totalData);
        setTopMemberClubsData(memberData);
        setWeeklyTopPostClubsData(weeklyPostClubsData);
      } catch (error) {
        console.error("통계 데이터 로딩 중 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-deep mb-6">대시보드</h2>
      
      {/* 관리 링크 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Link
          to="/admin/members"
          className="bg-gradient-to-br from-main-02 to-deep text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="material-icons text-4xl">people</span>
            <h3 className="text-xl font-bold">멤버 관리</h3>
          </div>
          <p className="text-light-03">전체 멤버 목록 조회 및 관리</p>
        </Link>

        <Link
          to="/admin/club-members"
          className="bg-gradient-to-br from-point to-point-hov text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="material-icons text-4xl">group</span>
            <h3 className="text-xl font-bold">클럽별 멤버</h3>
          </div>
          <p className="text-light-03">클럽별 멤버 목록 관리</p>
        </Link>

        <Link
          to="/admin/clubs"
          className="bg-gradient-to-br from-main-01 to-main-02 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="material-icons text-4xl">sports_soccer</span>
            <h3 className="text-xl font-bold">클럽 관리</h3>
          </div>
          <p className="text-light-03">전체 클럽 목록 조회 및 관리</p>
        </Link>
      </div>

      {/* 통계 섹션 */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-deep mb-6">통계 자료</h3>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">통계 데이터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* 전체 통계 카드 */}
            {totalStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="material-icons text-3xl text-main-01">people</span>
                    <h4 className="text-lg font-semibold text-gray-700">전체 멤버</h4>
                  </div>
                  <p className="text-3xl font-bold text-deep">{totalStats.totalMembers.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="material-icons text-3xl text-main-02">sports_soccer</span>
                    <h4 className="text-lg font-semibold text-gray-700">전체 클럽</h4>
                  </div>
                  <p className="text-3xl font-bold text-deep">{totalStats.totalClubs.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="material-icons text-3xl text-point">person_add</span>
                    <h4 className="text-lg font-semibold text-gray-700">최근 가입 멤버</h4>
                  </div>
                  <p className="text-3xl font-bold text-deep">{totalStats.recentMembers.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">(최근 7일)</p>
                </div>
              </div>
            )}

            {/* 통계 그래프 그리드 - 첫 줄: 3개 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* 금주의 신설 클럽 */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h4 className="text-xl font-bold text-deep mb-4">금주의 신설 클럽</h4>
                {weeklyClubsData ? (
                  <Chart
                    type="bar"
                    data={weeklyClubsData}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "최근 7일 신설 클럽 추이",
                        },
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
                )}
              </div>

              {/* 여성이 많은 클럽 TOP 5 */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h4 className="text-xl font-bold text-deep mb-4">여성이 많은 클럽 TOP 5</h4>
                {femaleClubsData ? (
                  <Chart
                    type="bar"
                    data={femaleClubsData}
                    options={{
                      indexAxis: "y",
                      plugins: {
                        title: {
                          display: true,
                          text: "여성 멤버 수 기준",
                        },
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
                )}
              </div>

              {/* 남성이 많은 클럽 TOP 5 */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h4 className="text-xl font-bold text-deep mb-4">남성이 많은 클럽 TOP 5</h4>
                {maleClubsData ? (
                  <Chart
                    type="bar"
                    data={maleClubsData}
                    options={{
                      indexAxis: "y",
                      plugins: {
                        title: {
                          display: true,
                          text: "남성 멤버 수 기준",
                        },
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
                )}
              </div>
            </div>

            {/* 통계 그래프 그리드 - 둘째 줄: 3개 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 전체 멤버 연령대별 분포 */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h4 className="text-xl font-bold text-deep mb-4">전체 멤버 연령대별 분포</h4>
                {ageClubsData ? (
                  <Chart
                    type="pie"
                    data={ageClubsData}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "전체 멤버 연령대별 비율",
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
                )}
              </div>

              {/* 멤버가 많은 클럽 TOP 5 */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h4 className="text-xl font-bold text-deep mb-4">멤버가 많은 클럽 TOP 5</h4>
                {topMemberClubsData ? (
                  <Chart
                    type="bar"
                    data={topMemberClubsData}
                    options={{
                      indexAxis: "y",
                      plugins: {
                        title: {
                          display: true,
                          text: "멤버 수 기준",
                        },
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
                )}
              </div>

              {/* 이번 주에 게시글이 많이 올라온 클럽 TOP 5 */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h4 className="text-xl font-bold text-deep mb-4">이번 주 게시글 많은 클럽 TOP 5</h4>
                {weeklyTopPostClubsData ? (
                  <Chart
                    type="bar"
                    data={weeklyTopPostClubsData}
                    options={{
                      indexAxis: "y",
                      plugins: {
                        title: {
                          display: true,
                          text: "최근 7일 게시글 수 기준",
                        },
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
