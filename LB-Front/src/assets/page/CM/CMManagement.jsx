import React, { useEffect, useMemo, useState } from "react";
import { Route, Routes, Link, useLocation } from "react-router-dom";
import CMopen from "./CMopen";
import CMjoinlist from "./CMjoinlist";
import Noticemanagement from "./Noticemanagement";
import { useClubStore } from "../../../api/ClubData";
import { useAuthStore } from "../../../stores/authStore";
import { apiClient } from "../../../api/config";
import {
  getProfileImageThumbnailUrl,
  getProfileImage,
} from "../../../api/profileimage";

function CMManagementMain() {
  // 전체 클럽 리스트 (/clubs)에서 내가 매니저인 클럽을 판별
  const { clubs, fetchClubs } = useClubStore();
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  
  // 프로필 정보 상태
  const [me, setMe] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // CMManagement 진입/경로 변경 시마다 최신 클럽 리스트 조회
  useEffect(() => {
    const loadClubs = async () => {
      try {
        await fetchClubs();
      } catch (err) {
        console.error("클럽 리스트 로드 실패:", err);
      }
    };
    loadClubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // 프로필 정보 가져오기
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const [meRes, profileData] = await Promise.all([
          apiClient.get("/me"),
          getProfileImage(),
        ]);
        setMe(meRes.data);
        setProfileImage(profileData ?? null);
      } catch (err) {
        console.error("내 정보 조회 실패:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchMe();
  }, []);

  // 내가 매니저인 클럽들만 필터링
  const myManagedClubs = useMemo(() => {
    if (!user?.id || !Array.isArray(clubs)) return [];
    // /clubs 응답에서 managerId === 현재 사용자 id 인 클럽이 있으면 "내가 개설한 커뮤니티"
    return clubs.filter((club) => club.managerId === user.id);
  }, [clubs, user]);

  const hasManagedClub = myManagedClubs.length > 0;
  
  // 프로필 정보 추출
  const name = me?.name ?? "";
  const gender = me?.gender ?? "M";
  const height = me?.height != null ? me.height : null;
  const weight = me?.weight != null ? me.weight : null;
  const heightWeightText =
    height != null && weight != null ? `${height}cm / ${weight}kg` : "-";
  const profileThumbnailUrl = getProfileImageThumbnailUrl(profileImage);
  
  // 관리자 뱃지 텍스트: 클럽이 있으면 첫 번째 클럽 이름, 없으면 "개설한 클럽이 없습니다."
  const adminBadgeText = myManagedClubs.length > 0
    ? `${myManagedClubs[0].name} 커뮤니티 관리자`
    : "개설한 클럽이 없습니다.";

  return (
    <>
      <div className="wrap  !bg-light-02 !mt-0 pt-[50px] py-[5%]">
        <div className="containers">
          {/* 프로필 */}
          <section className="profile w-full md:w-[50%] mx-auto flex items-center justify-center pt-5 rounded-[20px]">
            {profileLoading ? (
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div className="pf_img w-[64px] h-[64px] bg-gray-deep rounded-full overflow-hidden shrink-0 animate-pulse" />
                <span className="text-gray-500 text-sm">로딩 중...</span>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                {/* 프로필 이미지 */}
                <div className="pf_img w-[64px] h-[64px] bg-gray-deep rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                  {profileThumbnailUrl ? (
                    <img
                      src={profileThumbnailUrl}
                      alt="프로필"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-icons text-3xl text-gray-400" aria-hidden>
                      person
                    </span>
                  )}
                </div>

                {/* 이름 / 정보 */}
                <div className="flex flex-col min-w-[120px] items-center md:items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-black font-semibold text-base">
                      {name}
                    </span>
                    <div className="bg-main-02 rounded-full text-white w-[22px] h-[22px] flex items-center justify-center text-sm">
                      <i
                        className={`fa-solid ${gender === "F" ? "fa-venus" : "fa-mars"}`}
                        aria-hidden
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">{heightWeightText}</span>
                </div>

                {/* 관리자 뱃지 */}
                <div className="bg-[#d9fbd3] px-4 py-2 rounded-[14px] flex items-center gap-2">
                  <i className="fa-solid fa-users text-green-700" aria-hidden></i>
                  <span className="text-green-900 font-semibold text-sm whitespace-nowrap">
                    {adminBadgeText}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* 나머지 */}
          <section className="helpme py-[5%] flex items-center justify-center">
            <ul className="w-[90%] lg:w-full flex flex-col lg:flex-row justify-between items-center lg:gap-0.5 xl:gap-2 ">
              <li className="w-full lg:w-[32%] xl:w-[30%]">
                {/* 유저가 매니저인 클럽이 있으면: 커뮤니티 개설하기 카드 대신 개설한 클럽 카드 노출 */}
                {myManagedClubs.length > 0 ? (
                  <div className="flex flex-col justify-center items-center">
                    <h4 className="text-deep text-center mb-4 text-base md:text-lg mt-5">
                      나의 관리 커뮤니티
                    </h4>
                    <div className="rounded-[20px] overflow-hidden w-full">
                      <div className="grid grid-cols-1 gap-4 md:gap-6 ">
                        {myManagedClubs.map((club) => (
                          <Link
                            key={club.id}
                            to={`/club/detail/${club.id}`}
                            className="bg-deep rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform hover:-translate-y-1"
                          >
                            <div className="w-full h-[160px] md:h-[200px] overflow-hidden">
                              <img
                                src={club.image}
                                alt={club.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="p-3 md:p-4 flex flex-col items-center text-center gap-2 text-light-03">
                              <h4 className="text-base md:text-lg font-semibold">
                                {club.name}
                              </h4>
                              <p className="text-xs md:text-sm opacity-90 line-clamp-2 w-[80%]">
                                {club.desc}
                              </p>

                              <div className="flex flex-wrap lg:flex-nowrap justify-center gap-2 mt-2 md:mt-3">
                                {club.tags && club.tags.length > 0
                                  ? club.tags.map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 lg:px-1.5 xl:px-2 md:px-3 py-1 !text-xs lg:!text-[10px] xl:!text-sm md:!text-[14px] rounded-full bg-light-03 text-deep whitespace-nowrap "
                                      >
                                        #{tag}
                                      </span>
                                    ))
                                  : null}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="cmopen"
                    className="flex flex-col justify-center items-center"
                  >
                    <h4 className="text-deep mb-4 text-base md:text-lg mt-5">
                      커뮤니티 개설하기
                    </h4>
                    <div className="border border-main-02 overflow-hidden rounded-[20px] w-full">
                      <img
                        src="https://ynczwbybtbjftkatmcxg.supabase.co/storage/v1/object/sign/LB/cm_01.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjY5YTJlMy0zNGQxLTRkNTMtYWYzMC0wOWM5OTZhMzE0ODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9jbV8wMS5wbmciLCJpYXQiOjE3NzAxOTUyMzYsImV4cCI6MTgwMTczMTIzNn0.2OuxThJnhAcEjRmM0uYrpS2lesTfJhTM1YjLNxaJezc"
                        alt="img"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </Link>
                )}
              </li>

              <li className="w-full lg:w-[32%] xl:w-[30%]">
                <Link
                  to="cmjoinlist"
                  className="flex flex-col justify-center items-center"
                >
                  <h4 className="text-deep mb-4 text-base md:text-lg mt-5">
                    가입 신청 리스트
                  </h4>
                  <div
                    className={`border border-main-02 overflow-hidden rounded-[20px] w-full ${
                      hasManagedClub
                        ? "h-[350px] bg-white flex items-center justify-center"
                        : ""
                    }`}
                  >
                    <img
                      src="https://ynczwbybtbjftkatmcxg.supabase.co/storage/v1/object/sign/LB/cm_02.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjY5YTJlMy0zNGQxLTRkNTMtYWYzMC0wOWM5OTZhMzE0ODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9jbV8wMi5wbmciLCJpYXQiOjE3NzAxOTU3MzksImV4cCI6MTgwMTczMTczOX0.bKsf-9IonbfvVxFuvc47tc5vja03HLVo6SlQqE83qFk"
                      alt="img"
                      className="w-full  object-cover"
                    />
                  </div>
                </Link>
              </li>

              <li className="w-full lg:w-[32%] xl:w-[30%]">
                <Link
                  to="noticemanagement"
                  className="flex flex-col justify-center items-center"
                >
                  <h4 className="text-deep mb-4 text-base md:text-lg mt-5">
                    공지사항 관리
                  </h4>
                  <div
                    className={`border border-main-02 overflow-hidden rounded-[20px] w-full ${
                      hasManagedClub
                        ? "h-[350px] bg-white flex items-center justify-center"
                        : ""
                    }`}
                  >
                    <img
                      src="https://ynczwbybtbjftkatmcxg.supabase.co/storage/v1/object/sign/LB/cm_03.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjY5YTJlMy0zNGQxLTRkNTMtYWYzMC0wOWM5OTZhMzE0ODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9jbV8wMy5wbmciLCJpYXQiOjE3NzAxOTU3NTIsImV4cCI6MTgwMTczMTc1Mn0.OOiiJ4PpEUVfA_wRKJh-VvRS6Iy3Kg2awptk2JFj-eE"
                      alt="img"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}

function CMManagement() {
  return (
    <Routes>
      <Route path="/" element={<CMManagementMain />} />
      <Route path="cmopen" element={<CMopen />} />
      <Route path="cmjoinlist" element={<CMjoinlist />} />
      <Route path="noticemanagement/*" element={<Noticemanagement />} />
    </Routes>
  );
}

export default CMManagement;
