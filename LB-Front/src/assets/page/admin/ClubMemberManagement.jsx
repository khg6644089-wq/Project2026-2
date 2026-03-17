import React, { useState, useEffect, useMemo } from "react";
import { fetchAllClubs, fetchClubMembers, removeMemberFromClub } from "../../../api/AdminData";
import BtnComp from "../../../components/BtnComp";
import PageNatation from "../../../components/PageNatation";
import usePaginationStore from "../../../stores/paginationStore";

function ClubMemberManagement() {
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);

  const storeKey = "admin-club-members";
  const pagination = usePaginationStore((state) => state.paginations[storeKey]);
  const currentPage = pagination?.currentPage ?? 0;

  // 클럽 목록 조회
  useEffect(() => {
    const loadClubs = async () => {
      try {
        const data = await fetchAllClubs();
        setClubs(data);
        if (data.length > 0 && !selectedClubId) {
          setSelectedClubId(data[0].id.toString());
        }
      } catch (err) {
        console.error("클럽 목록 로드 실패:", err);
        setError("클럽 목록을 불러오는데 실패했습니다.");
      }
    };

    loadClubs();
  }, []);

  // 선택한 클럽의 멤버 목록 조회
  useEffect(() => {
    if (!selectedClubId) {
      setMembers([]);
      return;
    }

    const loadClubMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchClubMembers(selectedClubId);
        console.log("로드된 클럽 멤버 데이터:", data);
        setMembers(data || []);
      } catch (err) {
        console.error("클럽 멤버 목록 로드 실패:", err);
        setError(err.response?.data?.message || "멤버 목록을 불러오는데 실패했습니다.");
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    loadClubMembers();
  }, [selectedClubId]);

  // 페이지네이션된 데이터
  const paginatedMembers = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return members.slice(startIndex, endIndex);
  }, [members, currentPage, pageSize]);

  // 클럽에서 멤버 제거
  const handleRemove = async (memberId, memberName) => {
    if (!window.confirm(`${memberName}님을 이 클럽에서 제거하시겠습니까?`)) {
      return;
    }

    try {
      await removeMemberFromClub(selectedClubId, memberId);
      alert("멤버가 클럽에서 제거되었습니다.");
      // 목록 새로고침
      const data = await fetchClubMembers(selectedClubId);
      setMembers(data);
    } catch (err) {
      console.error("멤버 제거 실패:", err);
      alert(err.response?.data?.message || "멤버 제거에 실패했습니다.");
    }
  };

  const selectedClub = clubs.find((c) => c.id.toString() === selectedClubId);

  return (
    <div>
      <h2 className="text-3xl font-bold text-deep mb-6">클럽별 멤버 관리</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-deep mb-2">클럽 선택</label>
        <select
          value={selectedClubId}
          onChange={(e) => setSelectedClubId(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-main-02 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-02"
        >
          <option value="">클럽을 선택하세요</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}
        </select>
      </div>

      {selectedClub && (
        <div className="mb-6 p-4 bg-light-01 rounded-lg">
          <h3 className="font-semibold text-deep mb-2">{selectedClub.name}</h3>
          <p className="text-sm text-gray-600">{selectedClub.desc}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-600">로딩 중...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : !selectedClubId ? (
        <div className="text-center py-12 text-gray-600">클럽을 선택해주세요.</div>
      ) : paginatedMembers.length === 0 ? (
        <div className="text-center py-12 text-gray-600">멤버가 없습니다.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-main-02 text-sm">
              <thead>
                <tr className="bg-main-02 text-white">
                  <th className="border-r border-main-02 border-b border-main-02 px-4 py-3 text-left">아이디</th>
                  <th className="border-r border-main-02 border-b border-main-02 px-4 py-3 text-left">이름</th>
                  <th className="border-r border-main-02 border-b border-main-02 px-4 py-3 text-left">목표</th>
                  <th className="border-r border-main-02 border-b border-main-02 px-4 py-3 text-left">성별</th>
                  <th className="border-r border-main-02 border-b border-main-02 px-4 py-3 text-left">생년월일</th>
                  <th className="border-b border-main-02 px-4 py-3 text-left">특이사항</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.map((member) => (
                  <tr key={member.id || member.memberId} className="hover:bg-light-01">
                    <td className="border-r border-main-02 border-b border-main-02 px-4 py-3">
                      {member.id || member.memberId || "-"}
                    </td>
                    <td className="border-r border-main-02 border-b border-main-02 px-4 py-3">
                      {member.name || member.memberName || "-"}
                    </td>
                    <td className="border-r border-main-02 border-b border-main-02 px-4 py-3">
                      {member.goal || "-"}
                    </td>
                    <td className="border-r border-main-02 border-b border-main-02 px-4 py-3">
                      {member.gender === "M" ? "남성" : member.gender === "F" ? "여성" : member.gender || "-"}
                    </td>
                    <td className="border-r border-main-02 border-b border-main-02 px-4 py-3">
                      {member.birthday || "-"}
                    </td>
                    <td className="border-b border-main-02 px-4 py-3">
                      {member.special_notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <PageNatation
              storeKey={storeKey}
              totalElements={members.length}
              pageSize={pageSize}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ClubMemberManagement;
