import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  // persist(
  (set) => ({
    user: null, // id, email, name, roles 저장
    accessToken: null,
    setLogin: (authUserDto) => {
      const { accessToken, ...userInfo } = authUserDto;
      set({
        user: userInfo,
        accessToken: accessToken,
      });
    },

    setAccessToken: (token) => set({ accessToken: token }),

    setLogout: () => {
      set({ user: null, accessToken: null });
    },
  }),
  //   { name: "auth-storage" }, // 브라우저 새로고침 시에도 유지
  // ),
);
