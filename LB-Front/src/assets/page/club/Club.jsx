import React, { useState, useEffect, useMemo } from "react";
import { Route, Routes, Link } from "react-router-dom";
import ClubDetail from "./ClubDetail";
import PageNatation from "../../../components/PageNatation";
import { useClubStore, DefaultPostImageUrl } from "../../../api/ClubData";
import usePaginationStore from "../../../stores/paginationStore";

function ClubMain() {
  const [sort, setSort] = useState("latest");
  const [searchKeyword, setSearchKeyword] = useState("");
  const { clubs, fetchClubs, fetchClubsBySort, searchClubs, loading, error } =
    useClubStore();

  // 검색어와 정렬에 따라 데이터 로드
  useEffect(() => {
    const loadClubs = async () => {
      try {
        if (searchKeyword.trim()) {
          // 검색어가 있으면 검색 API 호출
          await searchClubs(searchKeyword.trim());
        } else {
          // 검색어가 없으면 정렬 API 호출
          await fetchClubsBySort(sort);
        }
      } catch (err) {
        console.error("클럽 데이터 로드 실패:", err);
      }
    };
    loadClubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, searchKeyword]);

  // 반응형 pageSize 상태
  const [pageSize, setPageSize] = useState(4);

  const storeKey = "test-list2";

  // paginationStore에서 현재 페이지 가져오기
  const pagination = usePaginationStore((state) => state.paginations[storeKey]);
  const currentPage = pagination?.currentPage ?? 0;
  const setPageSizeStore = usePaginationStore((state) => state.setPageSize);

  // 화면 크기에 따라 pageSize 설정 (최대 크기: 6개, 태블릿 이하: 4개)
  useEffect(() => {
    const handleResize = () => {
      const newPageSize = window.innerWidth >= 1024 ? 6 : 4;
      setPageSize(newPageSize);
    };

    // 초기 설정
    handleResize();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // pageSize 변경 시 paginationStore 업데이트
  useEffect(() => {
    setPageSizeStore(storeKey, pageSize);
  }, [pageSize, storeKey, setPageSizeStore]);

  // 정렬 변경 시 첫 페이지로 리셋
  const resetPagination = usePaginationStore((state) => state.resetPagination);
  useEffect(() => {
    resetPagination(storeKey);
  }, [sort, searchKeyword, storeKey, resetPagination]);

  // 검색 결과를 정렬하여 필터링
  const sortedClubs = useMemo(() => {
    if (!clubs || clubs.length === 0) return [];

    // 검색 결과가 있을 때만 정렬 적용
    if (searchKeyword.trim()) {
      const sorted = [...clubs];
      switch (sort) {
        case "latest":
          sorted.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
          });
          break;
        case "members":
          sorted.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
          break;
        case "posts":
          sorted.sort((a, b) => (b.postCount || 0) - (a.postCount || 0));
          break;
        default:
          break;
      }
      return sorted;
    }
    return clubs;
  }, [clubs, sort, searchKeyword]);

  // 현재 페이지에 보여줄 클럽만 슬라이스
  const currentPageClubs = useMemo(() => {
    if (!sortedClubs || sortedClubs.length === 0) return [];
    const start = currentPage * pageSize;
    return sortedClubs.slice(start, start + pageSize);
  }, [currentPage, pageSize, sortedClubs]);

  // 검색 핸들러
  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = e.target.searchInput?.value || searchKeyword;
    setSearchKeyword(keyword);
    resetPagination(storeKey);
  };

  // 검색어 입력 핸들러
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
  };

  return (
    <div className="myBg bg-light-03">
      {/* ================= 배너 ================= */}
      <div className="relative w-full h-[320px] overflow-hidden">
        <img
          src="https://yjpmigedokqexuclsapm.supabase.co/storage/v1/object/public/images/sdfasdfsdfdxs.png"
          alt="club banner"
          className="w-full h-full object-cover object-[50%_20%]"
        />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
          <h2 className="text-3xl font-bold mb-3">
            함께 이야기하고, 함께 성장하는 커뮤니티
          </h2>

          <div className="w-[600px] max-w-[92vw] h-1 bg-main-02 rounded-full mb-4" />

          <p className="text-sm opacity-90 max-w-[720px] leading-relaxed">
            혼자서는 쉽게 흐트러질 수 있는 운동 계획과 식단 관리를 서로 공유하고
            응 원하며, 꾸준히 실천할 수 있도록 돕는 것을 목표로 합니다. 매일의
            운동 기 록, 식단 사진 운동 루틴, 건강 관련 정보까지 자유롭게
            나눠보세요!
          </p>
        </div>
      </div>

      {/* ================= 검색 + 정렬 ================= */}
      <div className="mt-[10%] sm:mt-[5%]">
        <div className="containers">
          <div className="bg-white rounded-2xl shadow-lg px-2 py-8 flex flex-col items-center gap-6">
            {/* 검색창 */}
            <form
              onSubmit={handleSearch}
              className="flex items-center w-full max-w-[800px] bg-white border border-1 border-main-02 rounded-full overflow-hidden"
            >
              <input
                type="text"
                name="searchInput"
                value={searchKeyword}
                onChange={handleSearchInputChange}
                placeholder="검색어를 입력하세요"
                className="flex-1 px-6 py-3 text-sm outline-none bg-white"
              />

              <button
                type="submit"
                aria-label="검색"
                className="mr-2 w-9 h-9 rounded-full bg-main-02 text-white flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </button>
            </form>

            {/* 정렬 버튼 */}
            <div className="flex gap-3 flex-wrap justify-center ">
              <div className="flex flex-row justify-center items-center">
                <span className="material-icons mx-1 !text-[20px]">sort</span>
                <p className=" py-1.5 text-sm">정렬</p>
              </div>

              <button
                type="button"
                onClick={() => setSort("latest")}
                className={`border rounded-md transition-colors ${
                  sort === "latest"
                    ? "bg-deep text-white border-deep"
                    : "bg-white hover:bg-light-01"
                }`}
              >
                <p className="!px-2 !sm:px-3 !py-1 !sm:py-1.5 !text-xs !sm:text-sm">
                  최신순
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSort("members")}
                className={`border rounded-md transition-colors ${
                  sort === "members"
                    ? "bg-deep text-white border-deep"
                    : "bg-white hover:bg-light-01"
                }`}
              >
                <p className="!px-2 !sm:px-3 !py-1 !sm:py-1.5 !text-xs !sm:text-sm">
                  회원 많은 순
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSort("posts")}
                className={`border rounded-md transition-colors ${
                  sort === "posts"
                    ? "bg-deep text-white border-deep"
                    : "bg-white hover:bg-light-01"
                }`}
              >
                <p className="!px-2 !sm:px-3 !py-1 !sm:py-1.5 !text-xs !sm:text-sm">
                  게시글 많은 순
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 카드 리스트 ================= */}
      <div className="w-full mt-[0%] sm:mt-[3%] py-16">
        <div className="containers">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-lg">로딩 중...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-lg text-red-500">
                데이터를 불러오는 중 오류가 발생했습니다.
              </p>
            </div>
          ) : clubs && Array.isArray(clubs) && clubs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {currentPageClubs.map((club) => (
                <Link
                  key={club.id}
                  to={`detail/${club.id}`}
                  className="bg-deep rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform hover:-translate-y-1"
                >
                  <div className="w-full h-[200px] overflow-hidden">
                    <img
                      src={club.image}
                      alt={club.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = DefaultPostImageUrl;
                      }}
                    />
                  </div>

                  <div className="p-4 flex flex-col items-center text-center gap-2 text-light-03">
                    <h4 className="text-lg font-semibold">{club.name}</h4>
                    <p className="text-sm opacity-90 line-clamp-2">
                      {club.desc}
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      {club.tags &&
                        club.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 !text-[14px] !sm:text-xs !md:text-sm !lg:text-sm rounded-full bg-light-03 text-deep"
                          >
                            #{tag}
                          </span>
                        ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center py-20">
              <p className="text-lg">클럽 데이터가 없습니다.</p>
            </div>
          )}

          <div className="w-full flex justify-center mt-12">
            <PageNatation
              storeKey={storeKey}
              totalElements={sortedClubs.length}
              pageSize={pageSize}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Club() {
  return (
    <Routes>
      <Route path="/" element={<ClubMain />} />
      <Route path="detail/:id/*" element={<ClubDetail />} />
    </Routes>
  );
}

export default Club;
