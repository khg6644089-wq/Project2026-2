import { create } from "zustand";
import apiClient, { BASE_URL } from "./config";

export const useBoardsStore = create((set) => ({
  boards: [],
  normalBoards: [],
  boardDetail: null,
  loading: false,
  normalBoardsLoading: false,
  boardDetailLoading: false,
  error: null,
  normalBoardsError: null,
  boardDetailError: null,

  fetchBoards: async (clubId) => {
    set({ loading: true, error: null, boards: [] });
    try {
      const response = await apiClient.get(`/boards/${clubId}/boards/notice`);
      console.log("공지사항 API 응답:", response.data);
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.content || [];

      // 중복 제거: id를 기준으로 고유한 공지사항만 유지
      const uniqueData = rawData.filter(
        (board, index, self) =>
          index === self.findIndex((b) => b.id === board.id)
      );

      // API 응답을 컴포넌트에서 사용할 수 있는 형태로 변환
      // 이미 공지사항(board_type: 2)만 반환되므로 필터링 불필요
      const boardsData = uniqueData.map((board) => ({
        id: board.id,
        title: board.title || "",
        contents: board.contents || "",
        author: board.member_name || "",
        date: board.createdAt ? board.createdAt.substring(0, 10) : "",
        board_type: board.board_type || 2,
        boardType: board.board_type || 2, // 호환성을 위해 둘 다 유지
        likeCount: board.like_count || 0,
        viewCount: board.view_count || 0,
        clubId: board.club_id,
        memberId: board.member_id,
        profileFilename: board.profile_filename,
        fileId: board.file_id,
        filename: board.filename || board.file_filename,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
      }));

      set({ boards: boardsData, loading: false });
      return boardsData;
    } catch (error) {
      console.error("공지사항 데이터 가져오기 중 오류 발생:", error);
      set({ error: error.message || error, loading: false, boards: [] });
      throw error;
    }
  },

  fetchNormalBoards: async (clubId) => {
    set({ normalBoardsLoading: true, normalBoardsError: null, normalBoards: [] });
    try {
      const response = await apiClient.get(`/boards/${clubId}/boards/normal`);
      console.log("일반 게시글 API 응답:", response.data);
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.content || [];

      // API 응답을 컴포넌트에서 사용할 수 있는 형태로 변환
      // 이미 일반 게시글(board_type: 1)만 반환되므로 필터링 불필요
      // 중복 제거: id를 기준으로 고유한 게시글만 유지
      const uniqueData = rawData.filter(
        (board, index, self) =>
          index === self.findIndex((b) => b.id === board.id)
      );

      const boardsData = uniqueData.map((board) => ({
        id: board.id,
        title: board.title || "",
        contents: board.contents || "",
        author: board.member_name || "",
        date: board.createdAt ? board.createdAt.substring(0, 10) : "",
        board_type: board.board_type || 1,
        boardType: board.board_type || 1, // 호환성을 위해 둘 다 유지
        likeCount: board.like_count || 0,
        viewCount: board.view_count || 0,
        clubId: board.club_id,
        memberId: board.member_id,
        profileFilename: board.profile_filename,
        fileId: board.file_id,
        filename: board.filename || board.file_filename,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
      }));

      set({ normalBoards: boardsData, normalBoardsLoading: false });
      return boardsData;
    } catch (error) {
      console.error("일반 게시글 데이터 가져오기 중 오류 발생:", error);
      set({ normalBoardsError: error.message || error, normalBoardsLoading: false, normalBoards: [] });
      throw error;
    }
  },

  fetchBoardDetail: async (boardId) => {
    set({ boardDetailLoading: true, boardDetailError: null, boardDetail: null });
    try {
      const response = await apiClient.get(`/boards/${boardId}`);
      console.log("게시글 상세 API 응답:", response.data);
      const boardData = response.data;

      // API 응답을 컴포넌트에서 사용할 수 있는 형태로 변환
      const boardDetail = {
        id: boardData.id,
        title: boardData.title || "",
        contents: boardData.contents || "",
        author: boardData.member_name || "",
        date: boardData.createdAt ? boardData.createdAt.substring(0, 10) : "",
        board_type: boardData.board_type || 1,
        boardType: boardData.board_type || 1,
        likeCount: boardData.like_count || 0,
        viewCount: boardData.view_count || 0,
        clubId: boardData.club_id,
        memberId: boardData.member_id,
        profileFilename: boardData.profile_filename,
        fileId: boardData.file_id,
        filename: boardData.filename,
        createdAt: boardData.createdAt,
        updatedAt: boardData.updatedAt,
        deletedAt: boardData.deletedAt,
      };

      set({ boardDetail: boardDetail, boardDetailLoading: false });
      return boardDetail;
    } catch (error) {
      console.error("게시글 상세 데이터 가져오기 중 오류 발생:", error);
      set({ boardDetailError: error.message || error, boardDetailLoading: false, boardDetail: null });
      throw error;
    }
  },

  createBoard: async (formData) => {
    try {
      const response = await apiClient.post("/boards", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("게시글 생성 API 응답:", response.data);
      return response.data;
    } catch (error) {
      console.error("게시글 생성 중 오류 발생:", error);
      throw error;
    }
  },

  // 게시글 수정
  updateBoard: async (boardId, formData) => {
    if (!boardId) {
      throw new Error("boardId가 없습니다.");
    }

    try {
      const response = await apiClient.put(`/boards/${boardId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("게시글 수정 API 응답:", response.data);
      return response.data;
    } catch (error) {
      console.error("게시글 수정 중 오류 발생:", error);
      throw error;
    }
  },

  // 게시글 삭제 (deleted_at에 시간 기록)
  deleteBoard: async (boardId) => {
    if (!boardId) {
      throw new Error("boardId가 없습니다.");
    }

    try {
      const response = await apiClient.delete(`/boards/${boardId}`);
      console.log("게시글 삭제 API 응답:", response.data);
      return response.data;
    } catch (error) {
      console.error("게시글 삭제 중 오류 발생:", error);
      throw error;
    }
  },

  resetBoards: () => set({ boards: [], error: null }),
  resetNormalBoards: () => set({ normalBoards: [], normalBoardsError: null }),
  resetBoardDetail: () => set({ boardDetail: null, boardDetailError: null }),
}));
