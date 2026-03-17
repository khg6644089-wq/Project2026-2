import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "./config";

// 게시글 좋아요 상태 및 카운트를 관리하는 Zustand 스토어
export const useLikesStore = create(
  persist(
    (set, get) => ({
      // likes: { [boardId]: { liked: boolean, count: number } }
      likes: {},
      loading: false,
      error: null,

      // 컴포넌트에서 초깃값을 세팅할 때 사용 (예: 게시글 상세의 likeCount)
      // 이미 해당 boardId에 대한 상태가 있으면 liked는 그대로 두고,
      // 없을 때만 liked 기본값을 사용하도록 함 (페이지를 다시 들어와도 붉은 하트 유지)
      setInitialLike: (boardId, count = 0, liked = false) => {
        if (!boardId) return;
        set((state) => {
          const prev = state.likes[boardId];

          return {
            likes: {
              ...state.likes,
              [boardId]: {
                liked: prev?.liked ?? Boolean(liked),
                count:
                  typeof count === "number"
                    ? Math.max(0, count)
                    : prev?.count ?? 0,
              },
            },
          };
        });
      },

      // (옵션) 서버에서 게시글의 좋아요 카운트 & 현재 유저의 좋아요 상태를 다시 가져옴
      // GET /likes/{boardId}         -> 숫자(카운트)
      // GET /likes/{boardId}/status -> LikeDto { boardId, memberId, liked }
      fetchLikeCount: async (boardId) => {
        if (!boardId) return;

        set({ loading: true, error: null });
        try {
          // 1) 전체 카운트 숫자
          const countResponse = await apiClient.get(`/likes/${boardId}`);
          const countData = countResponse.data;

          let count = 0;
          if (typeof countData === "number") {
            count = countData;
          } else if (countData && typeof countData === "object") {
            // 혹시나 객체로 내려오는 경우까지 방어
            count = countData.likeCount ?? countData.count ?? 0;
          }

          // 2) 현재 로그인한 유저의 좋아요 상태 (LikeDto)
          let liked = get().likes[boardId]?.liked ?? false;
          try {
            const statusResponse = await apiClient.get(
              `/likes/${boardId}/status`,
            );
            const statusData = statusResponse.data;
            if (
              statusData &&
              typeof statusData === "object" &&
              typeof statusData.liked === "boolean"
            ) {
              liked = statusData.liked;
            }
          } catch (statusError) {
            // 상태 조회 실패 시, 기존 liked 값을 유지 (비로그인/404 등)
            console.error("좋아요 상태 조회 중 오류 발생:", statusError);
          }

          const safeCount = Math.max(0, Number(count) || 0);

          set((state) => ({
            likes: {
              ...state.likes,
              [boardId]: {
                liked,
                count: safeCount,
              },
            },
            loading: false,
          }));

          return { count: safeCount, liked };
        } catch (error) {
          console.error("좋아요 카운트 조회 중 오류 발생:", error);
          set({
            loading: false,
            error: error.message || String(error),
          });
          throw error;
        }
      },

      // 좋아요 토글 (POST / DELETE /likes/{boardId})
      toggleLike: async (boardId) => {
        if (!boardId) return;

        const state = get();
        const current = state.likes[boardId] || { liked: false, count: 0 };

        // 중복 클릭 방지
        if (state.loading) return;

        set({ loading: true, error: null });

        try {
          let response;
          let nextLiked;

          if (current.liked) {
            // 이미 좋아요 상태 → 취소 (DELETE)
            response = await apiClient.delete(`/likes/${boardId}`);
            nextLiked = false;
          } else {
            // 아직 좋아요 안 함 → 좋아요 (POST)
            response = await apiClient.post(`/likes/${boardId}`);
            nextLiked = true;
          }

          // 서버 응답 LikeDto에서 실제 liked 상태 확인
          const data = response?.data;
          let actualLiked = nextLiked;

          if (data && typeof data === "object") {
            // LikeDto: { boardId, memberId, liked: boolean }
            // 서버 응답의 liked 필드를 우선 사용
            if (typeof data.liked === "boolean") {
              actualLiked = data.liked;
            }
          }

          // POST/DELETE 후 서버에서 최신 카운트를 다시 가져와서 동기화
          let nextCount = current.count;
          try {
            const countResponse = await apiClient.get(`/likes/${boardId}`);
            const countData = countResponse.data;
            
            if (typeof countData === "number") {
              nextCount = countData;
            } else if (countData && typeof countData === "object") {
              nextCount = countData.likeCount ?? countData.count ?? nextCount;
            }
          } catch (countError) {
            console.error("좋아요 카운트 재조회 실패:", countError);
            // 카운트 조회 실패해도 클라이언트에서 계산
            nextCount = current.count + (actualLiked ? 1 : -1);
          }

          if (Number.isNaN(nextCount)) {
            nextCount = current.count;
          }

          nextCount = Math.max(0, Number(nextCount) || 0);

          set((prev) => ({
            likes: {
              ...prev.likes,
              [boardId]: {
                liked: actualLiked,
                count: nextCount,
              },
            },
            loading: false,
          }));

          return { liked: actualLiked, count: nextCount };
        } catch (error) {
          console.error("좋아요 처리 중 오류 발생:", error);
          set({
            loading: false,
            error: error.message || String(error),
          });
          // 컴포넌트에서 alert 등을 띄울 수 있도록 에러 그대로 던짐
          throw error;
        }
      },

      // 스토어 초기화 (옵션)
      resetLikes: () =>
        set({
          likes: {},
          loading: false,
          error: null,
        }),
    }),
    {
      name: "likes-store", // localStorage 키
      // 기본적으로 전체 상태를 저장하면 되므로 partialize는 별도 지정 안 함
    },
  ),
);

