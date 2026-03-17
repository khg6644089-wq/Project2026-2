import { create } from "zustand";
import apiClient, { BASE_URL } from "./config";

export const useMyClubStore = create((set) => ({
  myClubs: [],
  loading: false,
  error: null,

  fetchMyClubs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get("/myclubs");
      console.log("마이클럽 API 응답:", response.data);
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.content || [];

      // API 응답을 컴포넌트에서 사용할 수 있는 형태로 변환
      // Club.jsx에서 사용하는 구조와 최대한 동일하게 맞춤
      const clubsData = rawData.map((club) => ({
        id: club.clubId,
        name: club.clubName || "",
        // 필요 시 제목으로도 쓸 수 있게 title 필드도 함께 제공
        title: club.clubDescription
          ? club.clubDescription.split(".")[0]
          : club.clubName || "클럽",
        desc: club.clubDescription || "",
        // ClubData와 동일하게 filename 기반으로 이미지 URL 생성, 없으면 bgFileId 사용
        image: club.filename
          ? `${BASE_URL}/file/${club.filename}`
          : club.bgFileId
          ? `${BASE_URL}/file/${club.bgFileId}`
          : "https://yjpmigedokqexuclsapm.supabase.co/storage/v1/object/public/images/Image2.png",
        tags: club.keywords
          ? club.keywords.split(",").map((k) => k.trim())
          : [],
        memberCount: club.memberCount || 0,
        postCount: club.postCount || 0,
        managerId: club.managerId,
        managerName: club.managerName || null,
        createdAt: club.createdAt || null,
      }));

      set({ myClubs: clubsData, loading: false });
      return clubsData;
    } catch (error) {
      console.error("마이클럽 데이터 가져오기 중 오류 발생:", error);
      set({ error: error.message || error, loading: false, myClubs: [] });
      throw error;
    }
  },

  resetMyClubs: () => set({ myClubs: [], error: null }),
}));
