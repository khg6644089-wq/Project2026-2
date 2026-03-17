import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Chart from "../../../components/ChartComp";
import { cmChartOptions } from "../../../api/TestChartData";
import { getMyClubChartData } from "../../../api/MyClubChartData";
import PageNatation from "../../../components/PageNatation";
import { useMyClubStore } from "../../../api/MyClubData";
import { useClubStore } from "../../../api/ClubData";
import { useMyBoardsStore } from "../../../api/MyBoardsData";
import usePaginationStore from "../../../stores/paginationStore";
import { useAuthStore } from "../../../stores/authStore";

const PAGE_SIZE = 5; // 테이블 페이지 크기
const CLUB_PAGE_SIZE = 3; // 카드 리스트 페이지 크기

function CMHistory() {
  const navigate = useNavigate();
  // PageNatation에서 0-based page를 넘겨주므로 이에 맞춤
  const [page, setPage] = useState(0);
  const [clubPage, setClubPage] = useState(0);

  const {
    myClubs,
    fetchMyClubs,
    loading: clubsLoading,
    error: clubsError,
  } = useMyClubStore();

  // 전체 클럽 리스트에서 내가 매니저(개설자)인 클럽을 가져오기
  const { clubs, fetchClubs } = useClubStore();

  const {
    myBoards,
    fetchMyBoards,
    loading: boardsLoading,
    error: boardsError,
  } = useMyBoardsStore();

  const user = useAuthStore((state) => state.user);

  const resetPagination = usePaginationStore((state) => state.resetPagination);

  // 컴포넌트 마운트 시 페이지네이션 초기화
  useEffect(() => {
    resetPagination("cm-history");
    resetPagination("cm-history-clubs");
    setPage(0);
    setClubPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 마이클럽 데이터 로드
  useEffect(() => {
    const loadMyClubs = async () => {
      try {
        await fetchMyClubs();
      } catch (err) {
        console.error("마이클럽 데이터 로드 실패:", err);
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
        console.error("클럽 리스트 로드 실패:", err);
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
        console.error("내 게시글 데이터 로드 실패:", err);
      }
    };
    loadMyBoards();
  }, [fetchMyBoards]);

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

  // 클럽 ID로 클럽 이름 찾기
  const getClubName = (clubId) => {
    const club = joinedAndManagedClubs.find((c) => c.id === clubId);
    return club ? club.name : `클럽 #${clubId}`;
  };

  const totalElements = myBoards.length;

  // 현재 페이지 데이터 slice
  const currentPageItems = useMemo(() => {
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return myBoards.slice(start, end);
  }, [myBoards, page]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage); // 0-based
  };

  // 클럽 카드 페이지네이션
  const totalClubElements = joinedAndManagedClubs.length;
  const currentClubItems = useMemo(() => {
    const start = clubPage * CLUB_PAGE_SIZE;
    const end = start + CLUB_PAGE_SIZE;
    return joinedAndManagedClubs.slice(start, end);
  }, [joinedAndManagedClubs, clubPage]);

  const handleClubPageChange = (nextPage) => {
    setClubPage(nextPage); // 0-based
  };

  // 차트 데이터 생성
  const chartData = useMemo(() => {
    return getMyClubChartData(joinedAndManagedClubs, myBoards);
  }, [joinedAndManagedClubs, myBoards]);

  return (
    <>
      <div className="wrap">
        {/* 차트 영역 */}
        <section className=" mb-[5%]">
          <div className="containers mx-auto text-center ">
            <h3 className="text-main-02 text-base md:text-lg lg:text-xl xl:text-2xl">
              <i class="material-icons mx-5  mb-[3%]">groups</i>
              {user?.name
                ? `${user.name}님의 커뮤니티 활동 내역`
                : "나의 커뮤니티 활동 내역"}
            </h3>
            <hr className=" mt-[2%] border-t-10 border-main-02 my-4 mb-[2%]" />
            <div className="flex justify-center mb-[5%]">
              <span className="mt-[2%] inline-flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-1 rounded-full">
                <i class="material-icons">star</i>
                {user?.name
                  ? `${user.name}님이 가입한 커뮤니티`
                  : "님이 가입한 커뮤니티"}
              </span>
            </div>

            {/* ================= 카드 리스트 ================= */}

            {clubsLoading ? (
              <div className="w-full flex justify-center items-center h-[400px] text-gray-500 mb-[5%]">
                로딩 중...
              </div>
            ) : clubsError ? (
              <div className="w-full flex justify-center items-center h-[400px] text-red-500 mb-[5%]">
                데이터를 불러오는 중 오류가 발생했습니다.
              </div>
            ) : joinedAndManagedClubs.length === 0 ? (
              <div className="w-full flex justify-center items-center h-[400px] text-gray-500 mb-[5%]">
                가입한 커뮤니티가 없습니다.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1  lg:grid-cols-3 gap-10 mb-[5%]">
                  {currentClubItems.map((club) => (
                    <Link
                      key={club.id}
                      to={`/club/detail/${club.id}`}
                      className="bg-deep rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform hover:-translate-y-1"
                    >
                      <div className="w-full h-[200px] overflow-hidden">
                        <img
                          src={club.image}
                          alt={club.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-4 flex flex-col items-center text-center gap-2 text-light-03">
                        <h4 className="text-lg font-semibold">{club.name}</h4>
                        <p className="text-sm opacity-90 line-clamp-2">
                          {club.desc}
                        </p>

                        <div className="flex flex-wrap justify-center gap-2 mt-3">
                          {club.tags && club.tags.length > 0
                            ? club.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 !text-[14px] !sm:text-xs !md:text-sm !lg:text-sm rounded-full bg-light-03 text-deep"
                                >
                                  #{tag}
                                </span>
                              ))
                            : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {/* 클럽 카드 페이지네이션 - 3개 이상일 때만 표시 */}
                {totalClubElements > CLUB_PAGE_SIZE && (
                  <div className="flex justify-center mb-[5%]">
                    <PageNatation
                      storeKey="cm-history-clubs"
                      totalElements={totalClubElements}
                      pageSize={CLUB_PAGE_SIZE}
                      currentPage={clubPage}
                      pageFn={handleClubPageChange}
                    />
                  </div>
                )}
              </>
            )}
            <hr className=" my-[5%] border-t-10 border-main-02  " />
            <div className="flex justify-center mb-10">
              <span className="mt-[2%] inline-flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-1 rounded-full">
                <i className="fa-solid fa-calendar-days mr-2"></i>
                월간 활동 내역
              </span>
            </div>

            <div className="w-full max-w-[900px] mx-auto">
              <Chart type="line" data={chartData} options={cmChartOptions} />
            </div>
          </div>
        </section>

        {/* 테이블 영역 */}
        <section className="wrap mb-[5%]">
          <div className="containers mx-auto text-center">
            <hr className="border-t-10 border-main-02 mb-[5%]" />

            <div className="flex justify-center mb-[5%]">
              <span className="my-[3%] inline-flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-1 rounded-full">
                <i class="material-icons">assignment_turned_in</i>
                내가 작성한글
              </span>
            </div>

            <div className="mx-auto w-full max-w-[900px] mb-[5%] ">
              {/* 헤더 */}
              <div className="grid grid-cols-12 bg-gray-100 px-4 py-2 text-center font-semibold text-gray-600">
                <span className="col-span-1">번호</span>
                <span className="col-span-5">제목</span>
                <span className="col-span-3">모임명</span>
                <span className="col-span-3">날짜</span>
              </div>

              {/* 리스트 */}
              {boardsLoading ? (
                <div className="w-full flex justify-center items-center h-[200px] text-gray-500">
                  로딩 중...
                </div>
              ) : boardsError ? (
                <div className="w-full flex justify-center items-center h-[200px] text-red-500">
                  데이터를 불러오는 중 오류가 발생했습니다.
                </div>
              ) : myBoards.length === 0 ? (
                <div className="w-full flex justify-center items-center h-[200px] text-gray-500">
                  작성한 게시글이 없습니다.
                </div>
              ) : (
                currentPageItems.map((notice, idx) => (
                  <div
                    key={notice.id}
                    onClick={() => navigate(`/club/detail/${notice.clubId}/postlist/posting/${notice.id}`)}
                    className="grid grid-cols-12 px-4 py-3 text-center border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="col-span-1">
                      {page * PAGE_SIZE + idx + 1}
                    </span>

                    <span className="col-span-5 text-main-02 truncate">
                      {notice.title}
                    </span>

                    <span className="col-span-3">
                      {getClubName(notice.clubId)}
                    </span>

                    <span className="col-span-3">{notice.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 페이지네이션 */}
          <div className="flex justify-center pb-10">
            <PageNatation
              storeKey="cm-history" // ✅ 고유 키 (중요)
              totalElements={totalElements}
              pageSize={PAGE_SIZE}
              currentPage={page} // 초기값
              pageFn={handlePageChange} // 0-based로 넘어옴
            />
          </div>
        </section>
      </div>
    </>
  );
}

export default CMHistory;
