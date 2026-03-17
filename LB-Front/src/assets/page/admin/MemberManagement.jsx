import React, { useState, useEffect, useMemo } from "react";
import { fetchAllMembers, suspendMember } from "../../../api/AdminData";
import BtnComp from "../../../components/BtnComp";
import PageNatation from "../../../components/PageNatation";
import usePaginationStore from "../../../stores/paginationStore";

function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const storeKey = "admin-members";
  const pagination = usePaginationStore((state) => state.paginations[storeKey]);
  const currentPage = pagination?.currentPage ?? 0;
  const resetPagination = usePaginationStore((state) => state.resetPagination);

  // 컴포넌트 마운트 시 페이지네이션을 1페이지로 리셋
  useEffect(() => {
    resetPagination(storeKey);
  }, []);

  // 멤버 목록 조회
  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (searchKeyword) {
          params.keyword = searchKeyword;
        }
        const data = await fetchAllMembers(params);
        setMembers(data);
      } catch (err) {
        console.error("멤버 목록 로드 실패:", err);
        setError(err.response?.data?.message || "멤버 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [searchKeyword]);

  // 페이지네이션된 데이터
  const paginatedMembers = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return members.slice(startIndex, endIndex);
  }, [members, currentPage, pageSize]);

  // 멤버 정지
  const handleSuspend = async (memberId, memberName) => {
    if (!window.confirm(`${memberName}님을 정지하시겠습니까?`)) {
      return;
    }

    // 실제로 정지시키지 않으므로 API 호출 주석처리
    // try {
    //   await suspendMember(memberId);
    //   alert("멤버가 정지되었습니다.");
    //   // 목록 새로고침
    //   const data = await fetchAllMembers(searchKeyword ? { keyword: searchKeyword } : {});
    //   setMembers(data);
    // } catch (err) {
    //   console.error("멤버 정지 실패:", err);
    //   alert(err.response?.data?.message || "멤버 정지에 실패했습니다.");
    // }
    
    alert("정지되었습니다.");
  };

  // 멤버 상태 표시
  const getMemberStatus = (member) => {
    if (member.role === "SUSPENDED" || member.roles?.includes("SUSPENDED")) {
      return "정지";
    }
    return "정상";
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-3xl font-bold text-deep mb-4 md:mb-0">멤버 관리</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="이름 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="px-4 py-2 border border-main-02 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-02"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600">로딩 중...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : paginatedMembers.length === 0 ? (
        <div className="text-center py-12 text-gray-600">멤버가 없습니다.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1270px] border-collapse border border-main-02 text-sm">
              <thead>
                <tr className="bg-main-02 text-white">
                  <th className="border-r border-main-02 border-b border-main-02 px-4 py-3 text-left">ID</th>
                  <th className="border-r border-main-02 border-b border-main-02 px-4 py-3 text-left">이름</th>
                  <th className="border-r border-main-02 border-b border-main-02 px-4 py-3 text-left">연락처</th>
                  <th className="border-r border-main-02 border-b border-main-02 px-4 py-3 text-left">성별</th>
                  <th className="border-r border-main-02 border-b border-main-02 px-4 py-3 text-left">생일</th>
                  <th className="border-r border-main-02 border-b border-main-02 px-4 py-3 text-left">키</th>
                  <th className="border-r border-main-02 border-b border-main-02 px-4 py-3 text-left">몸무게</th>
                  <th className="border-r border-main-02 border-b border-main-02 px-4 py-3 text-left">골</th>
                  <th className="border-r border-main-02 border-b border-main-02 px-4 py-3 text-left">하루 권장 섭취 칼로리</th>
                  <th className="border-r border-main-02 border-b border-main-02 px-4 py-3 text-left">특이사항</th>
                  <th className="border-b border-main-02 px-4 py-3 text-left">상태</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-light-01">
                    <td className="border-r border-main-02 border-b border-main-02 px-4 py-3">{member.id || "-"}</td>
                    <td className="border-r border-main-02 border-b border-main-02 px-4 py-3">{member.name || "-"}</td>
                    <td className="border-r border-main-02 border-b border-main-02 px-4 py-3">{member.phone || "-"}</td>
                    <td className="border-r border-main-02 border-b border-main-02 px-4 py-3">
                      {member.gender === "M" ? "남성" : member.gender === "F" ? "여성" : member.gender || "-"}
                    </td>
                    <td className="border-r border-main-02 border-b border-main-02 px-4 py-3">{member.birthday || "-"}</td>
                    <td className="border-r border-main-02 border-b border-main-02 px-4 py-3">
                      {member.height ? `${member.height}cm` : "-"}
                    </td>
                    <td className="border-r border-main-02 border-b border-main-02 px-4 py-3">
                      {member.weight ? `${member.weight}kg` : "-"}
                    </td>
                    <td className="border-r border-main-02 border-b border-main-02 px-4 py-3">{member.goal || "-"}</td>
                    <td className="border-r border-main-02 border-b border-main-02 px-4 py-3">
                      {member.daily_calories ? `${member.daily_calories}kcal` : "-"}
                    </td>
                    <td className="border-r border-main-02 border-b border-main-02 px-4 py-3">{member.special_notes || "-"}</td>
                    <td className="border-b border-main-02 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={getMemberStatus(member) === "정지" ? "text-red-600 font-semibold" : "text-green-600"}>
                          {getMemberStatus(member)}
                        </span>
                        {getMemberStatus(member) !== "정지" && (
                          <BtnComp
                            variant="point"
                            size="short"
                            className="!w-auto !px-4 !mt-0"
                            onClick={() => handleSuspend(member.id, member.name || "멤버")}
                          >
                            정지
                          </BtnComp>
                        )}
                      </div>
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

export default MemberManagement;
