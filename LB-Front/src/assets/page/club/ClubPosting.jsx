import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBoardsStore } from "../../../api/BoardsData";
import { useClubDetailStore } from "../../../api/ClubDetailData";
import { useCommentsStore } from "../../../api/CommentsData";
import { useLikesStore } from "../../../api/LikesData";
import { useAuthStore } from "../../../stores/authStore";
import usePaginationStore from "../../../stores/paginationStore";
import BtnComp from "../../../components/BtnComp";
import PageNatation from "../../../components/PageNatation";
import { BASE_URL } from "../../../api/config";

function ClubPosting() {
  const { id: boardId } = useParams();
  const navigate = useNavigate();
  const {
    boardDetail,
    fetchBoardDetail,
    boardDetailLoading,
    boardDetailError,
    deleteBoard,
  } = useBoardsStore();
  const { club, fetchClubDetail } = useClubDetailStore();
  const {
    comments,
    page,
    loading: commentsLoading,
    error: commentsError,
    fetchComments,
    resetComments,
    createComment,
  } = useCommentsStore();
  const {
    likes,
    loading: likesLoading,
    toggleLike,
    setInitialLike,
    fetchLikeCount,
  } = useLikesStore();
  const user = useAuthStore((state) => state.user);
  const resetPagination = usePaginationStore((state) => state.resetPagination);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 내가 쓴 글인지 확인
  const isMyPost =
    user?.id && boardDetail?.memberId && user.id === boardDetail.memberId;

  // 게시글 상세 데이터 로드
  useEffect(() => {
    const loadBoardDetail = async () => {
      try {
        if (boardId) {
          await fetchBoardDetail(boardId);
        }
      } catch (err) {
        console.error("게시글 상세 데이터 로드 실패:", err);
      }
    };
    loadBoardDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  // 클럽 정보 로드
  useEffect(() => {
    const loadClubDetail = async () => {
      try {
        if (boardDetail?.clubId) {
          await fetchClubDetail(boardDetail.clubId);
        }
      } catch (err) {
        console.error("클럽 상세 데이터 로드 실패:", err);
      }
    };
    loadClubDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardDetail?.clubId]);

  // 댓글 데이터 로드
  useEffect(() => {
    const loadComments = async () => {
      try {
        if (boardId) {
          // 페이지네이션을 첫 페이지로 리셋
          resetPagination(`comment-list-${boardId}`);
          await fetchComments(boardId, 0);
        }
      } catch (err) {
        console.error("댓글 데이터 로드 실패:", err);
      }
    };

    loadComments();

    return () => {
      resetComments();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  // 좋아요 초기 상태 세팅
  // 1) 게시글 상세에서 내려준 likeCount로 기본 값 세팅
  // 2) 이어서 /likes/{boardId} GET으로 서버 기준 최신 상태(카운트 + 내가 눌렀는지)를 동기화
  useEffect(() => {
    if (!boardId || !boardDetail) return;

    const initLikeState = async () => {
      // 우선 상세 데이터 기준으로 기본값 세팅
      setInitialLike(boardId, boardDetail.likeCount || 0, false);

      try {
        await fetchLikeCount(boardId);
      } catch (err) {
        console.error("좋아요 초기 상태 동기화 실패:", err);
        // 실패해도 화면은 그대로 동작하도록 에러만 로그
      }
    };

    initLikeState();
  }, [boardId, boardDetail, setInitialLike, fetchLikeCount]);

  const handleLike = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!boardId || likesLoading) {
      return;
    }

    try {
      await toggleLike(boardId);
    } catch (err) {
      console.error("좋아요 처리 실패:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "좋아요 처리 중 오류가 발생했습니다.",
      );
    }
  };

  const handleEdit = () => {
    if (boardDetail?.clubId && boardId) {
      navigate(
        `/club/detail/${boardDetail.clubId}/postlist/postwrite?boardId=${boardId}`,
      );
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteBoard(boardId);
      alert("게시글이 삭제되었습니다.");
      if (boardDetail?.clubId) {
        navigate(`/club/detail/${boardDetail.clubId}/postlist`);
      } else {
        navigate(-1);
      }
    } catch (err) {
      console.error("게시글 삭제 실패:", err);
      alert(err.response?.data?.message || "게시글 삭제에 실패했습니다.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!commentContent.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createComment(boardId, commentContent);
      setCommentContent("");
      // 댓글 작성 후 첫 페이지로 리셋하고 댓글 목록 새로고침
      resetPagination(`comment-list-${boardId}`);
      await fetchComments(boardId, 0);
    } catch (err) {
      console.error("댓글 작성 실패:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "댓글 작성에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 상태
  if (boardDetailLoading) {
    return (
      <div className="w-full flex justify-center items-center h-[400px] text-gray-500">
        로딩 중...
      </div>
    );
  }

  // 에러 상태
  if (boardDetailError) {
    return (
      <div className="w-full flex justify-center items-center h-[400px] text-red-500">
        게시글을 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  // 데이터가 없을 때
  if (!boardDetail) {
    return (
      <div className="w-full flex justify-center items-center h-[400px] text-gray-500">
        게시글이 없습니다.
      </div>
    );
  }

  const currentLikeState = (boardId && likes[boardId]) || {
    liked: false,
    count: boardDetail.likeCount || 0,
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[1020px] px-4 py-10">
        {/* 게시글 영역 */}
        <section className="bg-white p-6 mb-10">
          {/* 모임명 + 아이콘 */}
          <div className="flex items-center gap-2 text-main-02 mb-2">
            <span className="material-icons text-lg">edit</span>
            <span className="text-sm font-semibold">
              {club?.name || ""} 모임
            </span>
          </div>

          {/* 제목 */}
          <h1 className="text-2xl font-bold mb-4">{boardDetail.title}</h1>

          {/* 작성자 / 날짜 */}
          <div className="flex justify-between items-end pb-1 border-b border-gray-200 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={
                    boardDetail.profileFilename
                      ? `${BASE_URL}/file/${boardDetail.profileFilename}`
                      : "https://yjpmigedokqexuclsapm.supabase.co/storage/v1/object/public/images/face.png"
                  }
                  className="w-full h-full object-cover scale-125"
                  alt="profile"
                />
              </div>

              <span className="text-sm text-gray-600 font-medium">
                {boardDetail.author || "정보 없음"}
              </span>
            </div>
            <span className="!text-sm text-gray-400">
              {boardDetail.date
                ? boardDetail.date.replace(/-/g, ".")
                : "정보 없음"}
            </span>
          </div>

          {/* 이미지 */}
          {boardDetail.filename && (
            <div className="w-full mb-6">
              <img
                src={`${BASE_URL}/file/${boardDetail.filename}`}
                alt={boardDetail.title}
                className="w-full rounded-lg object-cover"
              />
            </div>
          )}

          {/* 본문 */}
          <p className="text-gray-700 leading-relaxed mb-8 whitespace-pre-line">
            {boardDetail.contents}
          </p>

          {/* 버튼 영역 - 내가 쓴 글에서만 표시 */}
          {isMyPost && (
            <div className="flex justify-center gap-4">
              <button
                onClick={handleEdit}
                className="px-6 py-2 bg-main-02 text-white rounded-md cursor-pointer hover:bg-main-01 transition"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-point text-white rounded-md cursor-pointer hover:opacity-80 transition"
              >
                삭제
              </button>
            </div>
          )}
        </section>

        {/* 댓글 영역 */}
        <section className="bg-gray-200 p-6">
          {/* 댓글 헤더 */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-300 mb-6">
            <h2 className="!text-lg font-semibold">
              댓글{" "}
              <span className="text-main-02">
                {page?.totalElements !== undefined
                  ? page.totalElements
                  : comments.length}
              </span>
            </h2>

            {/* 조회수 + 좋아요 */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span className="material-icons text-base">visibility</span>
                <span>{boardDetail.viewCount || 0}</span>
              </div>

              {/* 좋아요 버튼 */}
              <button
                onClick={handleLike}
                className="flex items-center gap-1 cursor-pointer"
              >
                <span
                  className={`material-icons text-base transition-colors ${
                    currentLikeState.liked ? "text-pink-500" : "text-gray-400"
                  }`}
                >
                  favorite
                </span>
                <span>{currentLikeState.count}</span>
              </button>
            </div>
          </div>

          {/* 댓글 리스트 */}
          <div className="mb-6">
            {commentsLoading ? (
              <div className="py-6 text-center text-gray-500">
                댓글 로딩 중...
              </div>
            ) : commentsError ? (
              <div className="py-6 text-center text-red-500">
                댓글을 불러오는 중 오류가 발생했습니다.
              </div>
            ) : comments.length === 0 ? (
              <div className="py-6 text-center text-gray-500">
                첫 댓글을 남겨보세요.
              </div>
            ) : (
              <ul>
                {comments.map((comment) => {
                  const createdDate = comment.createdAt
                    ? comment.createdAt.substring(0, 10).replace(/-/g, ".")
                    : "";

                  return (
                    <li
                      key={comment.id}
                      className="flex gap-3 py-4 border-b border-gray-500 last:border-b-0"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                          src={
                            comment.profileFilename
                              ? `${BASE_URL}/file/${comment.profileFilename}`
                              : "https://yjpmigedokqexuclsapm.supabase.co/storage/v1/object/public/images/face.png"
                          }
                          className="w-full h-full object-cover scale-125"
                          alt="profile"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">
                            {comment.memberName || "익명"}
                          </span>
                          <span className="text-gray-400 !text-sm">
                            {createdDate || "날짜 정보 없음"}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{comment.content}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* 댓글 페이지네이션 */}
          {page && page.totalPages > 1 && (
            <div className="flex justify-center mb-6">
              <PageNatation
                storeKey={`comment-list-${boardId}`}
                totalElements={page.totalElements}
                pageSize={page.size || 10}
                totalPages={page.totalPages}
                pageFn={(nextPage) => {
                  if (boardId) {
                    fetchComments(boardId, nextPage);
                  }
                }}
              />
            </div>
          )}

          {/* 댓글 입력 */}
          <form onSubmit={handleCommentSubmit} className="relative">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="w-full border bg-white rounded-md p-3 pr-20 resize-none focus:outline-none focus:ring-1 focus:ring-main-02"
              rows={3}
              placeholder="댓글을 입력하세요"
            />
            <button
              type="submit"
              className="absolute bottom-3 right-3 px-5 py-1.5 mb-1 bg-main-02 text-white text-sm rounded-md hover:bg-main-01 transition"
            >
              {isSubmitting ? "등록 중..." : "등록"}
            </button>
          </form>
        </section>

        <div className="w-full sm:w-[50%] mx-auto flex items-center justify-center mb-[5%]  ">
          <BtnComp
            size="mid"
            variant="primary"
            onClick={() => {
              if (boardDetail?.clubId) {
                navigate(`/club/detail/${boardDetail.clubId}/postlist`);
              } else {
                navigate(-1);
              }
            }}
          >
            목록으로 돌아가기
          </BtnComp>
        </div>
      </div>
    </div>
  );
}

export default ClubPosting;
