import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchClubDetail, getClubStats } from "../../../api/AdminData";
import BtnComp from "../../../components/BtnComp";

function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadClubDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const [clubData, statsData] = await Promise.all([
          fetchClubDetail(id),
          getClubStats(id).catch(() => null), // 통계가 없어도 계속 진행
        ]);
        setClub(clubData);
        setStats(statsData);
      } catch (err) {
        console.error("클럽 상세 정보 로드 실패:", err);
        setError(err.response?.data?.message || "클럽 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadClubDetail();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center py-12 text-gray-600">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        {error}
        <div className="mt-4">
          <BtnComp variant="primary" size="mid" onClick={() => navigate("/admin/clubs")}>
            목록으로
          </BtnComp>
        </div>
      </div>
    );
  }

  if (!club) {
    return <div className="text-center py-12 text-gray-600">클럽을 찾을 수 없습니다.</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-deep">클럽 상세 정보</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 클럽 정보 */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-main-02 rounded-xl overflow-hidden shadow-md">
            <div className="h-48 overflow-hidden">
              <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-deep mb-3">{club.name}</h3>
              <p className="text-gray-600 mb-3 whitespace-pre-wrap text-sm">{club.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {club.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-light-01 text-deep text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">매니저 ID:</span> {club.managerId}
                </p>
                {club.managerName && (
                  <p>
                    <span className="font-semibold">매니저 이름:</span> {club.managerName}
                  </p>
                )}
                {club.createdAt && (
                  <p>
                    <span className="font-semibold">생성일:</span>{" "}
                    {new Date(club.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 통계 */}
        {stats && (
          <div className="bg-gradient-to-br from-main-02 to-deep text-white p-4 rounded-xl shadow-lg">
            <h4 className="text-lg font-bold mb-3">통계</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">멤버 수</span>
                <span className="text-xl font-bold">{stats.memberCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">게시글 수</span>
                <span className="text-xl font-bold">{stats.postCount || 0}</span>
              </div>
              {stats.boardCount !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">게시판 수</span>
                  <span className="text-xl font-bold">{stats.boardCount}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <BtnComp variant="primary" size="mid" className="!w-1/2" onClick={() => navigate("/admin/clubs")}>
          목록으로
        </BtnComp>
      </div>
    </div>
  );
}

export default ClubDetail;
