import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchAllClubs, suspendClub } from "../../../api/AdminData";
import BtnComp from "../../../components/BtnComp";
import PageNatation from "../../../components/PageNatation";
import usePaginationStore from "../../../stores/paginationStore";

function ClubManagement() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pageSize, setPageSize] = useState(6); // 세로 2개 x 가로 3개 = 6개

  const storeKey = "admin-clubs";
  const pagination = usePaginationStore((state) => state.paginations[storeKey]);
  const currentPage = pagination?.currentPage ?? 0;
  const resetPagination = usePaginationStore((state) => state.resetPagination);
  const setPage = usePaginationStore((state) => state.setPage);

  // 컴포넌트 마운트 시 페이지네이션을 1페이지로 리셋
  useEffect(() => {
    resetPagination(storeKey);
  }, []);

  // 클럽 목록 조회
  useEffect(() => {
    const loadClubs = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (searchKeyword) {
          params.keyword = searchKeyword;
        }
        const data = await fetchAllClubs(params);
        setClubs(data);
      } catch (err) {
        console.error("클럽 목록 로드 실패:", err);
        setError(
          err.response?.data?.message || "클럽 목록을 불러오는데 실패했습니다.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadClubs();
  }, [searchKeyword]);

  // 검색 필터링
  const filteredClubs = useMemo(() => {
    if (!searchKeyword) return clubs;
    const keyword = searchKeyword.toLowerCase();
    return clubs.filter(
      (club) =>
        club.name.toLowerCase().includes(keyword) ||
        (club.desc && club.desc.toLowerCase().includes(keyword)),
    );
  }, [clubs, searchKeyword]);

  // 페이지네이션된 데이터
  const paginatedClubs = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredClubs.slice(startIndex, endIndex);
  }, [filteredClubs, currentPage, pageSize]);

  // 클럽 정지
  const handleSuspend = async (clubId, clubName) => {
    if (!window.confirm(`${clubName} 클럽을 정지하시겠습니까?`)) {
      return;
    }

    // 실제로 정지시키지 않으므로 API 호출 주석처리
    // try {
    //   await suspendClub(clubId);
    //   alert("정지되었습니다.");
    //   // 목록 새로고침
    //   const data = await fetchAllClubs(searchKeyword ? { keyword: searchKeyword } : {});
    //   setClubs(data);
    // } catch (err) {
    //   console.error("클럽 정지 실패:", err);
    //   alert(err.response?.data?.message || "클럽 정지에 실패했습니다.");
    // }

    alert("정지되었습니다.");
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-3xl font-bold text-deep mb-4 md:mb-0">클럽 관리</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="클럽 이름 검색..."
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
      ) : paginatedClubs.length === 0 ? (
        <div className="text-center py-12 text-gray-600">클럽이 없습니다.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedClubs.map((club) => (
              <div
                key={club.id}
                className="bg-white border border-main-02 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={club.image}
                    alt={club.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="!text-xl font-bold text-deep mb-2">
                    {club.name}
                  </h3>
                  <p className="!text-sm text-gray-600 mb-3 line-clamp-2">
                    {club.desc}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {club.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-light-01 text-deep !text-[12px] rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/clubs/${club.id}`}
                      className="flex-1 text-center px-4 py-2 h-[38px] flex items-center justify-center bg-main-02 text-white rounded-lg hover:bg-deep transition-colors"
                    >
                      상세보기
                    </Link>
                    <BtnComp
                      variant="point"
                      size="short"
                      className="!w-auto !px-4 !mt-0 !h-[38px]"
                      onClick={() => handleSuspend(club.id, club.name)}
                    >
                      정지
                    </BtnComp>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <PageNatation
              storeKey={storeKey}
              totalElements={filteredClubs.length}
              pageSize={pageSize}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ClubManagement;
