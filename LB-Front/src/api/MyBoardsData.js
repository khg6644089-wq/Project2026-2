import { create } from "zustand";
import apiClient, { BASE_URL } from "./config";

export const useMyBoardsStore = create((set) => ({
  myBoards: [],
  loading: false,
  error: null,

  fetchMyBoards: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get("/boards/my");
      console.log("내 게시글 API 응답:", response.data);
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.content || [];

      // API 응답을 컴포넌트에서 사용할 수 있는 형태로 변환
      const boardsData = rawData.map((board) => ({
        id: board.id,
        title: board.title || "",
        contents: board.contents || "",
        author: board.member_name || "",
        date: board.createdAt ? board.createdAt.substring(0, 10) : "",
        board_type: board.board_type || 1,
        likeCount: board.like_count || 0,
        viewCount: board.view_count || 0,
        clubId: board.club_id,
        memberId: board.member_id,
        profileFilename: board.profile_filename,
        fileId: board.file_id,
        filename: board.filename,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        deletedAt: board.deletedAt,
      }));

      set({ myBoards: boardsData, loading: false });
      return boardsData;
    } catch (error) {
      console.error("내 게시글 데이터 가져오기 중 오류 발생:", error);
      set({ error: error.message || error, loading: false, myBoards: [] });
      throw error;
    }
  },

  resetMyBoards: () => set({ myBoards: [], error: null }),
}));
