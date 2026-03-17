import { create } from "zustand";
import apiClient from "./config";

export const useApplicationStore = create((set, get) => ({
  // 사용자 ID와 클럽 ID를 함께 키로 사용하여 application 상태 저장
  applications: {}, // { [userId_clubId]: application }
  loading: false,
  error: null,

  // 특정 클럽에 대한 현재 사용자의 가입 신청 상태 조회
  fetchMyApplication: async (clubId, userId) => {
    if (!userId) {
      return null;
    }
    
    const key = `${userId}_${clubId}`;
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/applications/status/${clubId}`);
      console.log("가입 신청 상태 API 응답 전체:", response);
      console.log("가입 신청 상태 API 응답 data:", response.data);
      console.log("응답 타입:", typeof response.data);
      console.log("응답 JSON:", JSON.stringify(response.data));
      
      // 응답이 객체인 경우 status 필드 추출
      let status = response.data;
      if (typeof status === "object" && status !== null) {
        status = status.status || status.data || String(status);
      }
      
      // 문자열로 변환하고 trim
      status = String(status).trim();
      
      console.log("최종 처리된 status:", status, "타입:", typeof status);
      console.log("status 길이:", status.length);
      console.log("status === 'APPROVED':", status === "APPROVED");
      console.log("status === 'PENDING':", status === "PENDING");
      
      // NONE인 경우 null 반환
      if (status === "NONE" || status === "") {
        set((state) => {
          const newApplications = { ...state.applications };
          delete newApplications[key];
          return {
            applications: newApplications,
            loading: false,
            error: null,
          };
        });
        return null;
      }
      
      // 상태값이 있는 경우 application 객체 생성
      const myApplication = {
        clubId: clubId,
        memberId: userId,
        status: status,
      };
      
      set((state) => ({
        applications: { ...state.applications, [key]: myApplication },
        loading: false,
        error: null,
      }));
      
      console.log("저장된 application:", myApplication, "status:", status);
      return myApplication;
    } catch (error) {
      console.error("가입 신청 상태 조회 중 오류 발생:", error);
      // 404 등으로 신청이 없는 경우는 정상적인 상황이므로 null로 설정
      if (error.response?.status === 404) {
        set((state) => {
          const newApplications = { ...state.applications };
          delete newApplications[key];
          return {
            applications: newApplications,
            loading: false,
            error: null,
          };
        });
        return null;
      }
      set({ error: error.message || error, loading: false });
      throw error;
    }
  },

  // 모임 가입 신청
  createApplication: async (clubId, userId) => {
    if (!userId) {
      throw new Error("사용자 ID가 필요합니다.");
    }
    
    const key = `${userId}_${clubId}`;
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post("/applications", {
        clubId: clubId,
      });
      console.log("모임 가입 신청 API 응답:", response.data);
      
      set((state) => ({
        applications: { ...state.applications, [key]: response.data },
        loading: false,
        error: null,
      }));
      return response.data;
    } catch (error) {
      console.error("모임 가입 신청 중 오류 발생:", error);
      set({ error: error.message || error, loading: false });
      throw error;
    }
  },

  // 특정 사용자와 클럽의 application 가져오기
  getApplication: (clubId, userId) => {
    if (!userId) {
      return null;
    }
    const state = get();
    const key = `${userId}_${clubId}`;
    const application = state.applications[key] || null;
    console.log("getApplication 호출 - clubId:", clubId, "userId:", userId, "key:", key, "application:", application);
    return application;
  },

  resetApplication: (clubId) => {
    if (clubId) {
      set((state) => {
        const newApplications = { ...state.applications };
        delete newApplications[clubId];
        return { applications: newApplications, error: null };
      });
    } else {
      set({ applications: {}, error: null });
    }
  },

  // 클럽별 가입 신청자 리스트 조회 (PENDING 상태만)
  pendingApplications: {}, // { [clubId]: [applications] }
  loadingPending: false,
  errorPending: null,

  fetchPendingApplications: async (clubId) => {
    if (!clubId) {
      return [];
    }
    
    set({ loadingPending: true, errorPending: null });
    try {
      const response = await apiClient.get(`/applications/club/${clubId}/pending`);
      console.log("가입 신청자 리스트 API 응답:", response.data);
      
      // 응답이 배열인 경우
      const applications = Array.isArray(response.data)
        ? response.data
        : response.data?.content || response.data?.data || [];
      
      // PENDING 상태인 것들만 필터링
      const pendingApps = applications.filter((app) => app.status === "PENDING");
      
      set((state) => ({
        pendingApplications: { ...state.pendingApplications, [clubId]: pendingApps },
        loadingPending: false,
        errorPending: null,
      }));
      
      return pendingApps;
    } catch (error) {
      console.error("가입 신청자 리스트 조회 중 오류 발생:", error);
      // 404 등으로 신청이 없는 경우는 빈 배열로 처리
      if (error.response?.status === 404) {
        set((state) => ({
          pendingApplications: { ...state.pendingApplications, [clubId]: [] },
          loadingPending: false,
          errorPending: null,
        }));
        return [];
      }
      set({ errorPending: error.message || error, loadingPending: false });
      throw error;
    }
  },

  // 특정 클럽의 pending applications 가져오기
  getPendingApplications: (clubId) => {
    if (!clubId) {
      return [];
    }
    const state = get();
    return state.pendingApplications[clubId] || [];
  },

  // 가입 승인
  approveApplication: async (applicationId) => {
    if (!applicationId) {
      throw new Error("신청 ID가 필요합니다.");
    }
    
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put(`/applications/${applicationId}/approve`);
      console.log("가입 승인 API 응답:", response.data);
      
      // 승인된 application 상태 업데이트
      const approvedApp = response.data;
      if (approvedApp && approvedApp.clubId && approvedApp.memberId) {
        const key = `${approvedApp.memberId}_${approvedApp.clubId}`;
        set((state) => ({
          applications: { ...state.applications, [key]: approvedApp },
          loading: false,
          error: null,
        }));
      }
      
      set({ loading: false, error: null });
      return response.data;
    } catch (error) {
      console.error("가입 승인 중 오류 발생:", error);
      set({ error: error.message || error, loading: false });
      throw error;
    }
  },

  // 가입 거절
  rejectApplication: async (applicationId) => {
    if (!applicationId) {
      throw new Error("신청 ID가 필요합니다.");
    }
    
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put(`/applications/${applicationId}/reject`);
      console.log("가입 거절 API 응답:", response.data);
      
      // 거절된 application 상태 업데이트
      const rejectedApp = response.data;
      if (rejectedApp && rejectedApp.clubId && rejectedApp.memberId) {
        const key = `${rejectedApp.memberId}_${rejectedApp.clubId}`;
        set((state) => ({
          applications: { ...state.applications, [key]: rejectedApp },
          loading: false,
          error: null,
        }));
      }
      
      set({ loading: false, error: null });
      return response.data;
    } catch (error) {
      console.error("가입 거절 중 오류 발생:", error);
      set({ error: error.message || error, loading: false });
      throw error;
    }
  },
}));
