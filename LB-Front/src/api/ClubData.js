import { create } from "zustand";
import apiClient, { BASE_URL } from "./config";

export const DefaultPostImageUrl =
  "https://ynczwbybtbjftkatmcxg.supabase.co/storage/v1/object/sign/LB/Frame%2068.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjY5YTJlMy0zNGQxLTRkNTMtYWYzMC0wOWM5OTZhMzE0ODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9GcmFtZSA2OC5wbmciLCJpYXQiOjE3NzI2NzU0NzAsImV4cCI6MTgwNDIxMTQ3MH0.ErPbcwDA4-KdW-Edr1iVtdJrOjrJQkwLLORgS70TcUA";

export const useClubStore = create((set) => ({
  clubs: [],
  loading: false,
  error: null,

  fetchClubs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get("/clubs");
      console.log("fetchClubs API 응답:", response.data);
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.content || [];

      // API 응답을 컴포넌트에서 사용할 수 있는 형태로 변환
      const clubsData = rawData.map((club) => ({
        id: club.id,
        name: club.name,
        title: club.description ? club.description.split(".")[0] : "클럽",
        desc: club.description || "",
        image: club.filename
          ? `${BASE_URL}/file/${club.filename}`
          : "https://yjpmigedokqexuclsapm.supabase.co/storage/v1/object/public/images/Image2.png",
        tags: club.keywords
          ? club.keywords.split(",").map((k) => k.trim())
          : [],
        memberCount: null, // API에 없으므로 null로 처리
        postCount: 0, // API에 없으면 기본값
        managerId: club.managerId,
        createdAt: club.createdAt,
      }));

      set({ clubs: clubsData, loading: false });
      console.log("클럽 데이터:", clubsData);
      return clubsData;
    } catch (error) {
      console.error("클럽 데이터 가져오기 중 오류 발생:", error);
      set({ error: error.message || error, loading: false, clubs: [] });
      throw error;
    }
  },

  fetchClubsBySort: async (sortType) => {
    set({ loading: true, error: null });
    try {
      let endpoint = "";
      switch (sortType) {
        case "latest":
          endpoint = "/clubs/latest";
          break;
        case "members":
          endpoint = "/clubs/mostMember";
          break;
        case "posts":
          endpoint = "/clubs/mostBoards";
          break;
        default:
          endpoint = "/clubs";
      }

      const response = await apiClient.get(endpoint);
      console.log("fetchClubsBySort API 응답:", response.data);
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.content || [];

      // API 응답을 컴포넌트에서 사용할 수 있는 형태로 변환
      const clubsData = rawData.map((club) => ({
        id: club.id,
        name: club.name,
        title: club.description ? club.description.split(".")[0] : "클럽",
        desc: club.description || "",
        image: `${BASE_URL}/file/${club.filename}`,
        tags: club.keywords
          ? club.keywords.split(",").map((k) => k.trim())
          : [],
        memberCount: club.memberCount || 0,
        postCount: club.postCount || 0,
        managerId: club.managerId,
        createdAt: club.createdAt,
      }));

      set({ clubs: clubsData, loading: false });
      return clubsData;
    } catch (error) {
      console.error("클럽 데이터 가져오기 중 오류 발생:", error);
      set({ error: error.message || error, loading: false, clubs: [] });
      throw error;
    }
  },

  searchClubs: async (keyword) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get("/clubs/search", {
        params: { keyword },
      });
      console.log("검색 API 응답:", response.data);
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.content || [];

      // API 응답을 컴포넌트에서 사용할 수 있는 형태로 변환
      const clubsData = rawData.map((club) => ({
        id: club.id,
        name: club.name,
        title: club.description ? club.description.split(".")[0] : "클럽",
        desc: club.description || "",
        image: club.filename
          ? `${BASE_URL}/file/${club.filename}`
          : "https://yjpmigedokqexuclsapm.supabase.co/storage/v1/object/public/images/Image2.png",
        tags: club.keywords
          ? club.keywords.split(",").map((k) => k.trim())
          : [],
        memberCount: club.memberCount || 0,
        postCount: club.postCount || 0,
        managerId: club.managerId,
        createdAt: club.createdAt,
      }));

      set({ clubs: clubsData, loading: false });
      return clubsData;
    } catch (error) {
      console.error("클럽 검색 중 오류 발생:", error);
      set({ error: error.message || error, loading: false, clubs: [] });
      throw error;
    }
  },

  resetClubs: () => set({ clubs: [], error: null }),
}));
