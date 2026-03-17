import { create } from "zustand";
import apiClient from "./config";

// 댓글 데이터 및 페이지네이션 관리를 위한 Zustand 스토어
export const useCommentsStore = create((set) => ({
  comments: [],
  page: {
    size: 10,
    number: 0,
    totalElements: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,

  // 특정 게시글(boardId)의 댓글 목록 조회 (페이지네이션 포함)
  fetchComments: async (boardId, page = 0) => {
    if (!boardId) return;

    set({
      loading: true,
      error: null,
    });

    try {
      const response = await apiClient.get(`/boards/${boardId}/comments`, {
        params: { page },
      });

      const data = response.data || {};
      const content = Array.isArray(data.content) ? data.content : [];

      const comments = content.map((comment) => ({
        id: comment.id,
        memberId: comment.memberId,
        memberName: comment.memberName,
        profileFilename: comment.profileFilename,
        content: comment.content,
        createdAt: comment.createdAt,
      }));

      const pageInfo = data.page || {
        size: 10,
        number: page,
        totalElements: comments.length,
        totalPages: 1,
      };

      set({
        comments,
        page: pageInfo,
        loading: false,
      });

      return { comments, page: pageInfo };
    } catch (error) {
      console.error("댓글 데이터 가져오기 중 오류 발생:", error);
      set({
        comments: [],
        page: {
          size: 10,
          number: 0,
          totalElements: 0,
          totalPages: 0,
        },
        loading: false,
        error: error.message || error,
      });
      throw error;
    }
  },

  // 댓글 작성
  createComment: async (boardId, content) => {
    if (!boardId || !content || !content.trim()) {
      throw new Error("댓글 내용을 입력해주세요.");
    }

    try {
      const response = await apiClient.post(`/boards/${boardId}/comments`, {
        content: content.trim(),
      });

      console.log("댓글 작성 API 응답:", response.data);
      return response.data;
    } catch (error) {
      console.error("댓글 작성 중 오류 발생:", error);
      throw error;
    }
  },

  // 댓글 상태 초기화
  resetComments: () =>
    set({
      comments: [],
      page: {
        size: 10,
        number: 0,
        totalElements: 0,
        totalPages: 0,
      },
      error: null,
    }),
}));

