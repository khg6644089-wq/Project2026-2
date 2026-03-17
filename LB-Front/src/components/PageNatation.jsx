import { useEffect } from 'react';
import usePaginationStore from '../stores/paginationStore';

function PageNatation({
  storeKey, // Zustand 스토어에서 사용할 고유 키 (여러 곳에서 사용 시 필수)
  totalElements, // 서버에서 받아온 총 요소 수
  pageSize = 10, // 한 페이지에 보여줄 요소 수
  currentPage, // 초기 현재 페이지 (0-based, storeKey가 없을 때만 사용)
  totalPages, // 총 페이지 수 (totalElements 대신 직접 전달 가능)
  pageFn, // 클릭 시 호출
}) {
  // Zustand 스토어에서 상태 가져오기
  const pagination = usePaginationStore((state) => state.paginations[storeKey]);
  const initializePagination = usePaginationStore((state) => state.initializePagination);
  const setPage = usePaginationStore((state) => state.setPage);

  // 페이지네이션 초기화 (컴포넌트 마운트 시)
  useEffect(() => {
    if (storeKey) {
      const initialPage = currentPage !== undefined ? currentPage : 0;
      initializePagination(storeKey, initialPage, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeKey]); // 초기화는 storeKey가 변경될 때만

  // pageSize 변경 시 스토어 업데이트
  useEffect(() => {
    if (storeKey && pagination && pagination.pageSize !== pageSize) {
      const setPageSize = usePaginationStore.getState().setPageSize;
      setPageSize(storeKey, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeKey, pageSize]);

  // 총 페이지 수 계산
  const calculatedTotalPages = totalPages !== undefined 
    ? totalPages 
    : (totalElements !== undefined && totalElements !== null && pageSize > 0 
        ? Math.ceil(totalElements / pageSize) 
        : 0);

  // 스토어에서 현재 페이지 가져오기 (0-based)
  // storeKey가 없으면 currentPage prop 사용 (하위 호환성)
  const storeCurrentPage = storeKey 
    ? (pagination?.currentPage ?? 0)
    : (currentPage !== undefined ? currentPage : 0);
  
  // 내부적으로는 1-based로 표시
  const internalCurrentPage = storeCurrentPage + 1;

  const handlePageChange = (page) => {
    if (page < 1 || page > calculatedTotalPages) return;
    
    // 스토어에 0-based로 저장
    if (storeKey) {
      setPage(storeKey, page - 1);
    }
    
    if (pageFn) {
      // 모든 pageFn은 0-based를 기대하므로 항상 0-based로 전달
      pageFn(page - 1);
    }
  };

  // 페이지 번호 그룹 계산 (5개씩 그룹화)
  const getPageNumbers = () => {
    const pages = [];
    const pageGroup = Math.ceil(internalCurrentPage / 5);
    const startPage = (pageGroup - 1) * 5 + 1;
    const endPage = Math.min(pageGroup * 5, calculatedTotalPages);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // totalPages가 0이면 표시하지 않음
  if (calculatedTotalPages === 0) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {/* 이전 버튼 */}
      <button
        onClick={() => handlePageChange(internalCurrentPage - 1)}
        disabled={internalCurrentPage === 1}
        className={`${
          internalCurrentPage === 1 ? '' : 'lg:hover:cursor-pointer'
        } w-10 h-10 rounded-md bg-white text-gray-deep border border-main-01 hover:bg-main-01 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300`}
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>

      {/* 페이지 번호 */}
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`lg:hover:cursor-pointer w-10 h-10 rounded-md transition-colors duration-300 ${
            internalCurrentPage === page
              ? 'bg-point text-white'
              : 'bg-white text-gray-deep border border-main-01 hover:bg-light-01'
          }`}
        >
          {page}
        </button>
      ))}

      {/* 다음 버튼 */}
      <button
        onClick={() => handlePageChange(internalCurrentPage + 1)}
        disabled={internalCurrentPage === calculatedTotalPages}
        className={`${
          internalCurrentPage === calculatedTotalPages ? '' : 'lg:hover:cursor-pointer'
        } w-10 h-10 rounded-md bg-white text-gray-deep border border-main-01 hover:bg-light-01 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300`}
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  );
}

export default PageNatation;
