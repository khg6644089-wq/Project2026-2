import { create } from "zustand";
import apiClient, { BASE_URL } from "./config";

export const DefaultPostImageUrl =
  "https://ynczwbybtbjftkatmcxg.supabase.co/storage/v1/object/sign/LB/Frame%2068.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjY5YTJlMy0zNGQxLTRkNTMtYWYzMC0wOWM5OTZhMzE0ODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9GcmFtZSA2OC5wbmciLCJpYXQiOjE3NzI2NzU0NzAsImV4cCI6MTgwNDIxMTQ3MH0.ErPbcwDA4-KdW-Edr1iVtdJrOjrJQkwLLORgS70TcUA";

export const useClubDetailStore = create((set) => ({
  club: null,
  loading: false,
  error: null,

  fetchClubDetail: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/clubsummaries/${id}`);
      console.log("클럽 상세 API 응답:", response.data);
      const clubData = response.data;

      // API 응답을 컴포넌트에서 사용할 수 있는 형태로 변환
      const clubDetail = {
        id: clubData.id,
        name: clubData.name,
        title: clubData.description
          ? clubData.description.split(".")[0]
          : "클럽",
        desc: clubData.description || "",
        image: clubData.filename
          ? `${BASE_URL}/file/${clubData.filename}`
          : "https://yjpmigedokqexuclsapm.supabase.co/storage/v1/object/public/images/Image2.png",
        tags: clubData.keywords
          ? clubData.keywords.split(",").map((k) => k.trim())
          : [],
        memberCount: clubData.memberCount || clubData.membersCount || null,
        postCount: clubData.postCount || 0,
        managerId: clubData.managerId,
        managerName:
          clubData.managerName ||
          clubData.manager ||
          clubData.clubManager ||
          null,
        createdAt: clubData.createdAt,
      };

      set({ club: clubDetail, loading: false });
      return clubDetail;
    } catch (error) {
      console.error("클럽 상세 데이터 가져오기 중 오류 발생:", error);
      set({ error: error.message || error, loading: false, club: null });
      throw error;
    }
  },

  resetClubDetail: () => set({ club: null, error: null }),

  createClub: async (formData) => {
    try {
      const response = await apiClient.post("/clubs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("클럽 생성 API 응답:", response.data);
      return response.data;
    } catch (error) {
      console.error("클럽 생성 중 오류 발생:", error);
      throw error;
    }
  },
}));
