import React, { useState, useEffect } from "react";
import { Route, Routes, Link, useParams } from "react-router-dom";
import ClubPosting from "./ClubPosting";
import ClubPostWrite from "./ClubPostWrite";
import PageNatation from "../../../components/PageNatation";
import { useClubDetailStore } from "../../../api/ClubDetailData";
import { useBoardsStore } from "../../../api/BoardsData";
import { BASE_URL, DEFAULT_POST_IMAGE_URL } from "../../../api/config";
import usePaginationStore from "../../../stores/paginationStore";
import { useAuthStore } from "../../../stores/authStore";

function ClubPostListMain() {
  const { id } = useParams();
  const [sort, setSort] = useState("latest");
  const { club, fetchClubDetail, loading, error } = useClubDetailStore();
  const {
    boards,
    fetchBoards,
    loading: boardsLoading,
    error: boardsError,
    normalBoards,
    fetchNormalBoards,
    normalBoardsLoading,
    normalBoardsError,
  } = useBoardsStore();
  const resetPagination = usePaginationStore((state) => state.resetPagination);
  const noticePagination = usePaginationStore(
    (state) => state.paginations["notice-list"],
  );
  const postPagination = usePaginationStore(
    (state) => state.paginations["post-list"],
  );
  const user = useAuthStore((state) => state.user);

  // 페이지네이션 리셋 (컴포넌트 마운트 시 또는 id 변경 시)
  useEffect(() => {
    resetPagination("notice-list");
    resetPagination("post-list");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 정렬 변경 시 페이지네이션 리셋
  useEffect(() => {
    resetPagination("post-list");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  // 클럽 상세 데이터 로드
  useEffect(() => {
    const loadClubDetail = async () => {
      try {
        if (id) {
          await fetchClubDetail(id);
        }
      } catch (err) {
        console.error("클럽 상세 데이터 로드 실패:", err);
      }
    };
    loadClubDetail();
  }, [id, fetchClubDetail]);

  // 게시판 데이터 로드
  useEffect(() => {
    const loadBoards = async () => {
      try {
        if (id) {
          await fetchBoards(id);
          await fetchNormalBoards(id);
        }
      } catch (err) {
        console.error("게시판 데이터 로드 실패:", err);
      }
    };
    loadBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-[400px] text-gray-500">
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center h-[400px] text-red-500">
        데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  if (!club) {
    return (
      <div className="w-full flex justify-center items-center h-[400px] text-gray-500">
        존재하지 않는 클럽입니다.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col pb-32">
      {/* ================= 배너 ================= */}
      <section className="relative w-full h-[260px] overflow-hidden">
        <img
          src={club.image}
          alt="club banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center px-4">
          <h2 className="text-2xl lg:text-3xl font-bold">
            {club.name}에 오신걸 환영합니다
          </h2>
          <div className="w-[520px] max-w-[90vw] h-[2px] bg-main-02 my-4" />
          <p className="text-xs lg:text-sm opacity-80">
            {club.desc || "자유로운 소통 공간"}
          </p>
          <p className="text-xs lg:text-sm opacity-80">
            공지사항을 꼭 확인해 주세요. 자유게시판에서는 편하게 이야기
            나누세요!
          </p>
        </div>
      </section>

      {/* ================= 공지사항 ================= */}
      <div className="w-full lg:w-[70%] mx-auto mt-16 px-4">
        <h3 className="!text-main-02 mb-5 !text-[20px] lg:!text-[28px] flex justify-center items-center">
          <span className="material-icons mr-2">campaign</span>
          {club.name} 전체 공지사항
        </h3>

        <div className="border border-main-02 rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 px-4 py-2 text-center font-semibold text-gray-600">
            <span className="col-span-1 text-left sm:text-center !text-sm !sm:text-md !md:text-lg">
              번호
            </span>
            <span className="col-span-5 text-left sm:text-center !text-sm !sm:text-md !md:text-lg">
              제목
            </span>
            <span className="col-span-3 !text-sm !sm:text-md !md:text-lg">
              작성자
            </span>
            <span className="col-span-3 !text-sm !sm:text-md !md:text-lg">
              작성일
            </span>
          </div>

          {(() => {
            const uniqueBoards = boards
              ? boards.filter(
                  (board, index, self) =>
                    index === self.findIndex((b) => b.id === board.id),
                )
              : [];

            if (boardsLoading) {
              return (
                <div className="px-4 py-8 text-center text-gray-500">
                  로딩 중...
                </div>
              );
            }

            if (boardsError) {
              return (
                <div className="px-4 py-8 text-center text-red-500">
                  공지사항을 불러오는 중 오류가 발생했습니다.
                </div>
              );
            }

            if (uniqueBoards.length === 0) {
              return (
                <div className="px-4 py-8 text-center text-gray-500">
                  공지사항이 없습니다.
                </div>
              );
            }

            // 페이지네이션 적용
            const NOTICE_PAGE_SIZE = 5;
            const currentPage = noticePagination?.currentPage || 0;
            const startIndex = currentPage * NOTICE_PAGE_SIZE;
            const endIndex = startIndex + NOTICE_PAGE_SIZE;
            const paginatedBoards = uniqueBoards.slice(startIndex, endIndex);

            return paginatedBoards.map((notice, idx) => (
              <Link
                key={notice.id}
                to={`posting/${notice.id}`}
                className="grid grid-cols-12 px-4 py-3 text-center border-b last:border-b-0 hover:bg-gray-50"
              >
                <span className="col-span-1 text-left sm:text-center !text-xs !sm:text-md !md:text-lg">
                  {startIndex + idx + 1}
                </span>
                <span className="col-span-5 text-left sm:text-center text-point-hov !text-sm !sm:text-md !md:text-lg truncate">
                  {notice.title}
                </span>
                <span className="col-span-3 !text-xs !sm:text-md !md:text-lg">
                  {notice.author || "정보 없음"}
                </span>
                <span className="col-span-3 !text-xs !sm:text-md !md:text-lg">
                  {notice.date || "정보 없음"}
                </span>
              </Link>
            ));
          })()}
        </div>

        {/*  공지사항 페이지네이션 */}
        <div className="w-full flex justify-center mt-12">
          <PageNatation
            storeKey="notice-list"
            totalElements={
              boards
                ? boards.filter(
                    (board, index, self) =>
                      index === self.findIndex((b) => b.id === board.id),
                  ).length
                : 0
            }
            pageSize={5}
          />
        </div>
      </div>

      {/* ================= 자유게시판 ================= */}
      <div className="w-full  lg:w-[80%] mx-auto mt-24 px-4 relative">
        {/* 타이틀 */}
        <div className="flex justify-center items-center text-main-02 mb-4">
          <span className="material-icons mr-2 text-[20px] lg:text-[26px]">
            article
          </span>
          <h3 className="!text-[20px] lg:!text-[28px]">
            {club.name} 자유게시판
          </h3>
        </div>

        {/* 정렬 */}
        <div className="flex justify-end mb-3 gap-1">
          {[
            { key: "latest", icon: "schedule", label: "최신" },
            { key: "likes", icon: "favorite", label: "좋아요" },
            { key: "views", icon: "visibility", label: "조회" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSort(item.key)}
              className={`flex items-center gap-0.5 px-2 py-0.5 text-[10px] rounded-full border
              ${sort === item.key ? "border-main-02 text-main-02" : "text-gray-400"}`}
            >
              <span className="material-icons text-[11px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(() => {
            // 중복 제거: id를 기준으로 고유한 게시글만 필터링
            const uniqueNormalBoards = normalBoards
              ? normalBoards.filter(
                  (board, index, self) =>
                    index === self.findIndex((b) => b.id === board.id),
                )
              : [];

            if (normalBoardsLoading) {
              return (
                <div className="col-span-3 px-4 py-8 text-center text-gray-500">
                  로딩 중...
                </div>
              );
            }

            if (normalBoardsError) {
              return (
                <div className="col-span-3 px-4 py-8 text-center text-red-500">
                  게시글을 불러오는 중 오류가 발생했습니다.
                </div>
              );
            }

            if (uniqueNormalBoards.length === 0) {
              return (
                <div className="col-span-3 px-4 py-8 text-center text-gray-500">
                  게시글이 없습니다.
                </div>
              );
            }

            // 정렬 처리
            let sortedBoards = [...uniqueNormalBoards];
            if (sort === "latest") {
              sortedBoards.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.date);
                const dateB = new Date(b.createdAt || b.date);
                return dateB - dateA;
              });
            } else if (sort === "likes") {
              sortedBoards.sort(
                (a, b) => (b.likeCount || 0) - (a.likeCount || 0),
              );
            } else if (sort === "views") {
              sortedBoards.sort(
                (a, b) => (b.viewCount || 0) - (a.viewCount || 0),
              );
            }

            // 페이지네이션 적용 (6개씩)
            const POST_PAGE_SIZE = 6;
            const currentPage = postPagination?.currentPage || 0;
            const startIndex = currentPage * POST_PAGE_SIZE;
            const endIndex = startIndex + POST_PAGE_SIZE;
            const paginatedBoards = sortedBoards.slice(startIndex, endIndex);

            return paginatedBoards.map((post) => (
              <Link
                key={post.id}
                to={`posting/${post.id}`}
                className="border border-main-02 rounded-xl hover:shadow-md transition bg-white"
              >
                <div className="flex justify-between px-4 pt-3 text-[10px] text-gray-400">
                  <span className="font-medium text-deep">
                    {post.author || "정보 없음"}
                  </span>
                  <span>{post.date || "정보 없음"}</span>
                </div>

                <div className="p-3">
                  <img
                    src={
                      post.filename
                        ? `${BASE_URL}/file/${post.filename}`
                        : post.fileId
                          ? `${BASE_URL}/file/${post.fileId}`
                          : DEFAULT_POST_IMAGE_URL
                    }
                    alt={post.title}
                    className="w-full h-[200px] rounded-md object-cover"
                  />
                </div>

                <div className="px-4 pb-4">
                  <h4 className="text-[14px] font-semibold line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-[12px] text-gray-600 line-clamp-2">
                    {post.contents || ""}
                  </p>

                  <div className="flex justify-end gap-3 text-[9px] text-gray-400 mt-2">
                    <span className="flex items-center gap-0.5">
                      <span className="material-icons text-[10px]">
                        visibility
                      </span>
                      {post.viewCount || 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span className="material-icons text-[10px]">
                        favorite
                      </span>
                      {post.likeCount || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ));
          })()}
        </div>

        {/* 글쓰기 버튼 영역 */}
        <div className="w-full flex justify-end mt-6">
          <Link
            to="postwrite"
            className="flex items-center gap-1 bg-main-02 text-white px-4 py-2 rounded-[4px] text-sm shadow hover:bg-main-01 transition"
            onClick={(e) => {
              if (!user?.id) {
                e.preventDefault();
                alert("로그인 시 이용 가능합니다");
              }
            }}
          >
            <span className="material-icons text-[18px]">edit</span>
            게시물 작성
          </Link>
        </div>

        {/* ✅ 자유게시판 페이지네이션 */}
        <div className="w-full flex justify-center mt-14">
          <PageNatation
            storeKey="post-list"
            totalElements={
              normalBoards
                ? normalBoards.filter(
                    (board, index, self) =>
                      index === self.findIndex((b) => b.id === board.id),
                  ).length
                : 0
            }
            pageSize={6}
          />
        </div>
      </div>
    </div>
  );
}

function ClubPostList() {
  return (
    <Routes>
      <Route path="/" element={<ClubPostListMain />} />
      <Route path="posting/:id" element={<ClubPosting />} />
      <Route path="postwrite" element={<ClubPostWrite />} />
    </Routes>
  );
}

export default ClubPostList;
