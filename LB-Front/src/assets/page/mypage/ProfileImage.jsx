import React, { useState, useEffect, useRef } from "react";
import {
  getProfileImageThumbnailUrl,
  getProfileImage,
  updateProfileImage,
  deleteProfileImage,
} from "../../../api/profileimage";

function ProfileImage() {
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [profileImageDeleting, setProfileImageDeleting] = useState(false);
  const [showProfileImageMenu, setShowProfileImageMenu] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const fileInputRef = useRef(null);
  const profileImageMenuRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const data = await getProfileImage();
      setProfileImage(data);
    };
    load();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showProfileImageMenu &&
        profileImageMenuRef.current &&
        !profileImageMenuRef.current.contains(e.target)
      ) {
        setShowProfileImageMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileImageMenu]);

  const handleProfileImageAreaClick = () => {
    if (profileImageUploading) return;
    setShowProfileImageMenu((prev) => !prev);
  };

  const handleProfileImageReplace = () => {
    setShowProfileImageMenu(false);
    fileInputRef.current?.click();
  };

  const handleProfileImageDelete = async () => {
    if (!profileImage?.filename) return;
    setShowProfileImageMenu(false);
    setProfileImageDeleting(true);
    setProfileError(null);
    try {
      await deleteProfileImage();
      setProfileImage(null);
    } catch (err) {
      console.error("프로필 이미지 삭제 실패:", err);
      setProfileError(
        err.response?.data?.message || "프로필 이미지 삭제에 실패했습니다."
      );
    } finally {
      setProfileImageDeleting(false);
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageUploading(true);
    setProfileError(null);
    try {
      const data = await updateProfileImage(file);
      setProfileImage(data);
    } catch (err) {
      console.error("프로필 이미지 업로드 실패:", err);
      setProfileError(
        err.response?.data?.message || "프로필 이미지 변경에 실패했습니다."
      );
    } finally {
      setProfileImageUploading(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleProfileImageChange}
        disabled={profileImageUploading}
      />
      <div
        className="relative flex flex-col items-center"
        ref={profileImageMenuRef}
      >
        <button
          type="button"
          onClick={handleProfileImageAreaClick}
          disabled={profileImageUploading}
          className="flex items-center justify-center rounded-full border-2 border-main-02 w-[40px] h-[40px] overflow-hidden bg-light-03 cursor-pointer hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="프로필 이미지 메뉴"
        >
          {profileImageUploading ? (
            <span className="text-deep text-xs">...</span>
          ) : getProfileImageThumbnailUrl(profileImage) ? (
            <img
              src={getProfileImageThumbnailUrl(profileImage)}
              alt="프로필"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-icons text-2xl leading-none text-deep">
              person
            </span>
          )}
        </button>
        {showProfileImageMenu && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 py-1 min-w-[120px] bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              type="button"
              onClick={handleProfileImageReplace}
              className="w-full px-3 py-2 text-left text-sm text-deep hover:bg-gray-100"
            >
              이미지 교체
            </button>
            {profileImage?.filename && (
              <button
                type="button"
                onClick={handleProfileImageDelete}
                disabled={profileImageDeleting}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {profileImageDeleting ? "삭제 중..." : "이미지 삭제"}
              </button>
            )}
          </div>
        )}
        {profileError && (
          <p className="text-red-500 text-xs mt-1 text-center max-w-[200px]">
            {profileError}
          </p>
        )}
      </div>
    </>
  );
}

export default ProfileImage;
