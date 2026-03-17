import { create } from 'zustand';

const usePaginationStore = create((set) => ({
  // 여러 페이지네이션 인스턴스를 key로 구분하여 관리
  paginations: {},

  // 페이지네이션 초기화
  initializePagination: (key, initialPage = 0, pageSize = 10) => {
    set((state) => {
      // 이미 초기화되어 있으면 초기화하지 않음
      if (state.paginations[key]) {
        return state;
      }
      return {
        paginations: {
          ...state.paginations,
          [key]: {
            currentPage: initialPage,
            pageSize: pageSize,
          },
        },
      };
    });
  },

  // 현재 페이지 설정 (0-based)
  setPage: (key, page) => {
    set((state) => {
      if (!state.paginations[key]) {
        return state;
      }
      return {
        paginations: {
          ...state.paginations,
          [key]: {
            ...state.paginations[key],
            currentPage: page,
          },
        },
      };
    });
  },

  // 페이지 크기 설정
  setPageSize: (key, size) => {
    set((state) => {
      if (!state.paginations[key]) {
        return state;
      }
      return {
        paginations: {
          ...state.paginations,
          [key]: {
            ...state.paginations[key],
            pageSize: size,
            currentPage: 0, // 페이지 크기 변경 시 첫 페이지로 리셋
          },
        },
      };
    });
  },

  // 특정 페이지네이션 상태 가져오기
  getPagination: (key) => {
    return (state) => state.paginations[key] || null;
  },

  // 특정 페이지네이션 리셋
  resetPagination: (key) => {
    set((state) => {
      if (!state.paginations[key]) {
        return state;
      }
      return {
        paginations: {
          ...state.paginations,
          [key]: {
            ...state.paginations[key],
            currentPage: 0,
          },
        },
      };
    });
  },

  // 특정 페이지네이션 제거
  removePagination: (key) => {
    set((state) => {
      const newPaginations = { ...state.paginations };
      delete newPaginations[key];
      return { paginations: newPaginations };
    });
  },
}));

export default usePaginationStore;
