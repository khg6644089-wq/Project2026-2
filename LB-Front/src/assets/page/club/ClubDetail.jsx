import React, { useEffect, useState } from "react";
import { Link, Route, Routes, useParams, useNavigate } from "react-router-dom";
import ClubPostList from "./ClubPostList";
import BtnComp from "../../../components/BtnComp";
import {
  DefaultPostImageUrl,
  useClubDetailStore,
} from "../../../api/ClubDetailData";
import { useBoardsStore } from "../../../api/BoardsData";
import { useApplicationStore } from "../../../api/ApplicationData";
import { BASE_URL, DEFAULT_POST_IMAGE_URL } from "../../../api/config";
import { useAuthStore } from "../../../stores/authStore";

function ClubDetailMain() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const user = useAuthStore((state) => state.user);
  const {
    fetchMyApplication,
    createApplication,
    getApplication,
    loading: applicationLoading,
  } = useApplicationStore();

  // store에서 application 상태 구독
  const application = useApplicationStore((state) => {
    if (!id || !user?.id) return null;
    const key = `${user.id}_${id}`;
    return state.applications[key] || null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          // 클럽 ID가 변경될 때 데이터 초기화
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

  // 가입 신청 상태 확인 (클럽 ID가 변경될 때마다)
  useEffect(() => {
    const loadApplicationStatus = async () => {
      if (id && user?.id) {
        try {
          await fetchMyApplication(id, user.id);
        } catch (err) {
          console.error("가입 신청 상태 확인 실패:", err);
        }
      }
    };
    loadApplicationStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  // 모임 가입 신청 핸들러
  const handleJoinClub = async () => {
    if (!id || isSubmitting) {
      return;
    }

    // 로그인하지 않은 유저인 경우 알림 표시하고 종료
    if (!user?.id) {
      alert("로그인 시 이용 가능합니다");
      return;
    }

    setIsSubmitting(true);
    try {
      await createApplication(id, user.id);
      alert("모임 가입 신청이 완료되었습니다.");
    } catch (err) {
      console.error("모임 가입 신청 실패:", err);
      alert(
        err.response?.data?.message || "모임 가입 신청 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="w-full flex flex-col ">
      {/* 상단 배너 */}
      <section className="relative w-full h-[450px] overflow-hidden">
        <img
          src={club.image || DefaultPostImageUrl}
          alt="club banner"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.target.src = DefaultPostImageUrl;
          }}
        />

        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center px-4">
          {/* 클럽 타이틀 */}
          <div className="bg-white rounded-full px-10 py-2 mb-3">
            <h1 className="text-3xl font-bold text-main-02">{club.name}</h1>
          </div>

          {/* 클럽 기본 정보: 개설일, 회원수, CM */}
          <div className="flex flex-wrap justify-center gap-4 text-white mb-4">
            <span className="!text-sm">
              개설일:{" "}
              {club.createdAt ? club.createdAt.substring(0, 10) : "정보 없음"}
            </span>
            <span className="!text-sm">
              회원수:{" "}
              {club.memberCount !== null && club.memberCount !== undefined
                ? `${club.memberCount}명`
                : "정보 없음"}
            </span>
            <span className="!text-sm">
              운영자: {club.managerName || club.managerId || "정보 없음"}
            </span>
          </div>

          {/* 구분선 */}
          <div className="w-[600px] max-w-[92vw] h-1 bg-main-02 rounded-full mb-4" />

          {/* 클럽 설명 */}
          <p className="text-sm mb-4 max-w-[700px] text-white whitespace-pre-line mb-5">
            {club.desc}
          </p>

          {/* 태그 */}
          <div className="flex flex-wrap justify-center gap-2 mt-0 mb-5">
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

          {/* 모임 참여 버튼 */}
          {(() => {
            // 1. 매니저인 경우 버튼 숨김
            if (club.managerId === user?.id) {
              return null;
            }

            // 2. status가 PENDING 또는 APPROVED인 경우 버튼 숨김
            const status = application?.status;
            console.log("=== 버튼 표시 체크 ===");
            console.log("application:", application);
            console.log("status 원본:", status);
            console.log("status 타입:", typeof status);
            console.log("status JSON:", JSON.stringify(status));

            // status를 문자열로 변환하고 대소문자 무시하고 비교
            const statusStr = String(status || "").trim();
            const statusUpper = statusStr.toUpperCase();

            console.log("statusStr:", statusStr);
            console.log("statusUpper:", statusUpper);
            console.log("PENDING 비교 (원본):", statusStr === "PENDING");
            console.log("APPROVED 비교 (원본):", statusStr === "APPROVED");
            console.log("PENDING 비교 (대문자):", statusUpper === "PENDING");
            console.log("APPROVED 비교 (대문자):", statusUpper === "APPROVED");

            // 대소문자 무시하고 비교
            if (statusUpper === "PENDING" || statusUpper === "APPROVED") {
              console.log("버튼 숨김 - status:", statusStr);
              return null;
            }

            // 3. 그 외의 경우 버튼 표시
            console.log("버튼 표시");
            return (
              <button
                onClick={handleJoinClub}
                disabled={isSubmitting || applicationLoading}
                className="mt-4 w-[280px] py-2 rounded-full bg-main-02 text-white font-medium hover:bg-main-01 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || applicationLoading
                  ? "신청 중..."
                  : "모임 가입 하기"}
              </button>
            );
          })()}
        </div>
      </section>

      {/* 대표 공지사항 섹션 */}
      <div className="w-full mt-30 px-4 sm:px-8 lg:px-16">
        <h3 className=" !text-main-02 mb-[20px] !text-[20px] lg:!text-[30px] flex items-center justify-center ">
          <span className="material-icons mr-[5px] !text-[30px] lg:!text-[40px] ">
            campaign
          </span>
          {club.name} 대표 공지사항
        </h3>

        <div className="w-full lg:w-[70%] mx-auto border rounded-lg border-gray-200 overflow-hidden">
          {/* 헤더 */}
          <div className="grid grid-cols-12 bg-gray-100 px-4 py-2 text-center font-semibold text-gray-600">
            <span className="col-span-1 text-left sm:text-center !text-sm !sm:text-md !md:text-lg ">
              번호
            </span>
            <span className="col-span-5 text-left sm:text-center !text-sm !sm:text-md !md:text-lg ">
              제목
            </span>
            <span className="col-span-3 !text-sm !sm:text-md !md:text-lg ">
              작성자
            </span>
            <span className="col-span-3 !text-sm !sm:text-md !md:text-lg ">
              작성일
            </span>
          </div>
          {/* 공지사항 리스트 */}
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

            return uniqueBoards.slice(0, 3).map((notice, idx) => (
              <div
                key={notice.id}
                onClick={() =>
                  navigate(`/club/detail/${id}/postlist/posting/${notice.id}`)
                }
                className="grid grid-cols-12 px-4 py-3 text-center border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
              >
                <span className="col-span-1 text-left sm:text-center !text-xs !sm:text-md !md:text-lg">
                  {idx + 1}
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
              </div>
            ));
          })()}
        </div>
      </div>

      {/* 게시글 리스트 */}
      <div className="w-full lg:w-[70%] mx-auto mt-30 px-4 sm:px-8 lg:px-16">
        <div className=" !text-main-02  flex items-center justify-center flex-row mb-[5%]">
          <span class="material-icons mr-1">article</span>
          <h3 className=" !text-[20px] lg:!text-[30px] ">최신 게시글</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
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
                <div className="col-span-2 px-4 py-8 text-center text-gray-500">
                  로딩 중...
                </div>
              );
            }

            if (normalBoardsError) {
              return (
                <div className="col-span-2 px-4 py-8 text-center text-red-500">
                  게시글을 불러오는 중 오류가 발생했습니다.
                </div>
              );
            }

            if (uniqueNormalBoards.length === 0) {
              return (
                <div className="col-span-2 px-4 py-8 text-center text-gray-500">
                  게시글이 없습니다.
                </div>
              );
            }

            return uniqueNormalBoards.slice(0, 4).map((post) => (
              <div
                key={post.id}
                onClick={() =>
                  navigate(`/club/detail/${id}/postlist/posting/${post.id}`)
                }
                className="border border-main-02 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer bg-white overflow-hidden"
              >
                {/* 이미지 */}
                <div className="p-2">
                  <img
                    src={
                      post.filename
                        ? `${BASE_URL}/file/${post.filename}`
                        : post.fileId
                          ? `${BASE_URL}/file/${post.fileId}`
                          : DEFAULT_POST_IMAGE_URL
                    }
                    alt={post.title}
                    className="w-full h-60 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = DefaultPostImageUrl;
                    }}
                  />
                </div>

                {/* 글 내용 */}
                <div className="p-4">
                  <h3 className="font-semibold !text-2xl !sm:text-xl mb-2 text-deep">
                    {post.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-2 line-clamp-2">
                    {post.contents}
                  </p>
                  <div className="text-gray-500 text-xs sm:text-sm flex justify-between">
                    <span className="!text-sm !sm:text-md">
                      {post.author || "정보 없음"}
                    </span>
                    <span className="!text-sm !sm:text-md">
                      {post.date || "정보 없음"}
                    </span>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>

        {/* 더보기 버튼 */}
        {/* <div className="flex justify-center mt-16 mb-30">
          <button className="w-50% sm:w-1/2 lg:w-1/3 px-6 py-3 rounded-full bg-main-02 text-white font-medium hover:bg-main-01 transition">
            게시물 더보기
          </button>
        </div> */}
        <Link to="../postlist">
          <div className="w-[50%] flex flex-col flex-wrap mt-16 mb-30 mx-auto">
            <BtnComp size="long" variant="primary">
              게시물 더보기
            </BtnComp>
          </div>
        </Link>
      </div>
    </div>
  );
}

function ClubDetail() {
  return (
    <Routes>
      <Route path="/" element={<ClubDetailMain />} />
      <Route path="postlist/*" element={<ClubPostList />} />
      {/* detail/:id 중첩 route는 필요 없으면 제거 가능 */}
      {/* <Route path="detail/:id/*" element={<ClubDetail />} /> */}
    </Routes>
  );
}

export default ClubDetail;
