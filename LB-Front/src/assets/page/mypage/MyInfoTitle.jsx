import { useState, useEffect } from "react";
import { apiClient } from "../../../api/config";
import {
  getProfileImageThumbnailUrl,
  getProfileImage,
} from "../../../api/profileimage";

/**
 * 마이페이지 프로필 영역 - 이름, 성별, 키/몸무게, 목표 체중·포인트 뱃지
 * GET /me 로 조회한 데이터로 표시
 */
function MyInfoTitle() {
  const [me, setMe] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const [meRes, profileData] = await Promise.all([
          apiClient.get("/me"),
          getProfileImage(),
        ]);
        setMe(meRes.data);
        setProfileImage(profileData ?? null);
        setError(null);
      } catch (err) {
        console.error("내 정보 조회 실패:", err);
        setError(err.response?.data?.message || "내 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  if (loading) {
    return (
      <section className="profile mt-[5%] w-full md:w-[50%] mx-auto flex items-center justify-center p-4 rounded-[20px]">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="pf_img w-[64px] h-[64px] bg-gray-deep rounded-full overflow-hidden shrink-0 animate-pulse" />
          <span className="text-gray-500 text-sm">로딩 중...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="profile mt-[5%] w-full md:w-[50%] mx-auto flex items-center justify-center p-4 rounded-[20px]">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <span className="text-red-500 text-sm">{error}</span>
        </div>
      </section>
    );
  }

  const name = me?.name ?? "";
  const gender = me?.gender ?? "M";
  const height = me?.height != null ? me.height : null;
  const weight = me?.weight != null ? me.weight : null;
  const goalWeight = me?.goal_weight != null ? me.goal_weight : null;
  const point = me?.point != null ? me.point : null;

  const heightWeightText =
    height != null && weight != null ? `${height}cm / ${weight}kg` : "-";
  const badgeText = `목표 체중: ${goalWeight != null ? `${goalWeight}kg` : "-"} 보유 포인트: ${point != null ? point : "-"}`;
  const profileThumbnailUrl = getProfileImageThumbnailUrl(profileImage);

  return (
    <section className="profile mt-[5%] w-full md:w-[50%] mx-auto flex items-center justify-center p-4 rounded-[20px]">
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
        {/* 프로필 이미지 (GET /me/profile-image + 썸네일 URL) */}
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
            <span className="text-black font-semibold text-base">{name}</span>
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
          <i className="fa-solid fa-users text-green-700" aria-hidden />
          <span className="text-green-900 font-semibold text-sm whitespace-nowrap">
            {badgeText}
          </span>
        </div>
      </div>
    </section>
  );
}

export default MyInfoTitle;
