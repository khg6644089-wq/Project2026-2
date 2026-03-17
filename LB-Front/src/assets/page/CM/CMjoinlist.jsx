import React, { useState, useEffect, useMemo } from "react";
import BtnComp from "../../../components/BtnComp";
import PageNatation from "./../../../components/PageNatation";
import usePaginationStore from "../../../stores/paginationStore";
import { useApplicationStore } from "../../../api/ApplicationData";
import { useClubStore } from "../../../api/ClubData";
import { useAuthStore } from "../../../stores/authStore";

function CMjoinlist() {
  // 반응형 pageSize 상태
  const [pageSize, setPageSize] = useState(4);

  const storeKey = "cm-join-list";

  // paginationStore에서 현재 페이지 가져오기
  const pagination = usePaginationStore((state) => state.paginations[storeKey]);
  const currentPage = pagination?.currentPage ?? 0;
  const setPageSizeStore = usePaginationStore((state) => state.setPageSize);

  // API 및 상태 관리
  const { fetchPendingApplications, loadingPending, approveApplication, rejectApplication } = useApplicationStore();
  const { clubs, fetchClubs } = useClubStore();
  const user = useAuthStore((state) => state.user);

  // 가입 신청 리스트 상태
  const [joinRequests, setJoinRequests] = useState([]);
  const [clubName, setClubName] = useState("");

  // 내가 매니저인 클럽들 필터링
  const myManagedClubs = useMemo(() => {
    if (!user?.id || !Array.isArray(clubs)) return [];
    return clubs.filter((club) => club.managerId === user.id);
  }, [clubs, user]);

  // 화면 크기에 따라 pageSize 설정 (PC: 9개, 태블릿: 6개, 모바일: 4개)
  useEffect(() => {
    const handleResize = () => {
      let newPageSize;
      if (window.innerWidth >= 1024) {
        // PC
        newPageSize = 9;
      } else if (window.innerWidth >= 640) {
        // 태블릿
        newPageSize = 6;
      } else {
        // 모바일
        newPageSize = 4;
      }
      setPageSize(newPageSize);
    };

    // 초기 설정
    handleResize();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // pageSize 변경 시 paginationStore 업데이트
  useEffect(() => {
    setPageSizeStore(storeKey, pageSize);
  }, [pageSize, storeKey, setPageSizeStore]);

  // 클럽 리스트 및 가입 신청 리스트 가져오기
  useEffect(() => {
    const loadData = async () => {
      try {
        // 클럽 리스트 가져오기
        await fetchClubs();
      } catch (err) {
        console.error("클럽 리스트 로드 실패:", err);
      }
    };
    loadData();
  }, [fetchClubs]);

  // 매니저인 클럽의 가입 신청 리스트 가져오기
  useEffect(() => {
    const loadPendingApplications = async () => {
      if (myManagedClubs.length === 0) {
        setJoinRequests([]);
        setClubName("");
        return;
      }

      try {
        // 모든 매니저 클럽의 가입 신청을 합쳐서 가져오기
        const allRequests = [];
        for (const club of myManagedClubs) {
          const requests = await fetchPendingApplications(club.id);
          // 클럽 정보를 포함하여 저장
          const requestsWithClub = requests.map((req) => ({
            ...req,
            clubId: club.id,
            clubName: club.name,
          }));
          allRequests.push(...requestsWithClub);
        }

        // 최신순 정렬 (createdAt 또는 applicationId 기준)
        const sortedRequests = allRequests.sort((a, b) => {
          // createdAt이 있으면 그것을 기준으로 정렬
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          // createdAt이 없으면 applicationId 기준으로 정렬 (큰 값이 최신)
          return (b.applicationId || 0) - (a.applicationId || 0);
        });

        setJoinRequests(sortedRequests);
        // 첫 번째 클럽 이름을 기본값으로 설정 (여러 클럽이 있을 경우)
        if (myManagedClubs.length > 0) {
          setClubName(myManagedClubs[0].name);
        }
      } catch (err) {
        console.error("가입 신청 리스트 로드 실패:", err);
        setJoinRequests([]);
      }
    };

    loadPendingApplications();
  }, [myManagedClubs, fetchPendingApplications]);

  // 페이지네이션된 데이터
  const paginatedRequests = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return joinRequests.slice(startIndex, endIndex);
  }, [joinRequests, currentPage, pageSize]);

  // 가입 승인 핸들러
  const handleApprove = async (applicationId, clubId) => {
    if (!applicationId) {
      alert("신청 정보를 찾을 수 없습니다.");
      return;
    }
    
    try {
      await approveApplication(applicationId);
      alert("가입 승인이 처리되었습니다.");
      // 승인 후 리스트 새로고침
      const allRequests = [];
      for (const club of myManagedClubs) {
        const requests = await fetchPendingApplications(club.id);
        const requestsWithClub = requests.map((req) => ({
          ...req,
          clubId: club.id,
          clubName: club.name,
        }));
        allRequests.push(...requestsWithClub);
      }
      // 최신순 정렬
      const sortedRequests = allRequests.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return (b.applicationId || 0) - (a.applicationId || 0);
      });
      setJoinRequests(sortedRequests);
    } catch (error) {
      console.error("가입 승인 실패:", error);
      alert("가입 승인 처리 중 오류가 발생했습니다.");
    }
  };

  // 가입 거절 핸들러
  const handleReject = async (applicationId, clubId) => {
    if (!applicationId) {
      alert("신청 정보를 찾을 수 없습니다.");
      return;
    }
    
    try {
      await rejectApplication(applicationId);
      alert("가입 승인이 거절되었습니다.");
      // 거절 후 리스트 새로고침
      const allRequests = [];
      for (const club of myManagedClubs) {
        const requests = await fetchPendingApplications(club.id);
        const requestsWithClub = requests.map((req) => ({
          ...req,
          clubId: club.id,
          clubName: club.name,
        }));
        allRequests.push(...requestsWithClub);
      }
      // 최신순 정렬
      const sortedRequests = allRequests.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return (b.applicationId || 0) - (a.applicationId || 0);
      });
      setJoinRequests(sortedRequests);
    } catch (error) {
      console.error("가입 거절 실패:", error);
      alert("가입 거절 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <div className="wrap !mt-0 !bg-light-02 min-h-[calc(100vh-240px)] md:min-h-[calc(100vh-180px)]">
        <div className="containers">
          {/* sect_tit */}
          <section className="sect_tit flex items-center justify-center mx-0 mt-[50px] border-b-[5px] border-main-02 ">
            <h3 className=" !text-main-02 mb-[20px] !text-[20px] lg:!text-[30px] flex items-center justify-center ">
              <span className="material-icons mr-[5px] !text-[30px] lg:!text-[40px] ">
                list
              </span>
              {clubName} 모임의 신청 리스트
            </h3>
          </section>

          {/* list */}
          <section className="ac_list w-[80%] mx-auto my-[5%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingPending ? (
              <div className="col-span-full text-center py-8 text-gray-600">
                로딩 중...
              </div>
            ) : paginatedRequests.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-600">
                가입 신청이 없습니다.
              </div>
            ) : (
              paginatedRequests.map((request) => (
                <div
                  key={request.applicationId}
                  className="bg-white rounded-xl shadow-sm border border-[#E0F2C9] p-6 flex flex-col items-center justify-center gap-4"
                >
                  <p className="text-center text-gray-800 leading-relaxed">
                    {request.memberName} 회원님이
                    <br />
                    {request.clubName || clubName} 모임에
                    <br />
                    가입을 신청하셨습니다
                  </p>

                <div className="flex gap-2 w-[50%] min-w-[180px] mx-auto ">
                  <BtnComp
                    variant="primary"
                    size="short"
                    className="!w-[48%] !mt-0 !h-[35px] !text-xs md:!text-sm btn_save  "
                    onClick={() => handleApprove(request.applicationId, request.clubId)}
                  >
                    수락
                  </BtnComp>

                  <BtnComp
                    variant="point"
                    size="short"
                    className="!w-[48%] !mt-0 !h-[35px] !text-xs md:!text-sm btn_can"
                    onClick={() => handleReject(request.applicationId, request.clubId)}
                  >
                    거절
                  </BtnComp>
                </div>
              </div>
              ))
            )}
          </section>

          {/* 페이지네이션 */}
          <div className="w-full mb-[50px]">
            <PageNatation
              storeKey={storeKey}
              totalElements={joinRequests.length}
              pageSize={pageSize}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default CMjoinlist;
