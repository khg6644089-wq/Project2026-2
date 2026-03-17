import React, { useState, useRef } from "react";
import BtnComp from "../../../components/BtnComp";
import { apiClient } from "../../../api/config";

function MealAnal({
  resultTextClassName,
  titleClassName,
  containerClassName,
  onImageChange,
  onFileSelected,
  onAnalyzeSuccess,
  showResult = true,
}) {
  const cameraInputRef = useRef(null);   // 카메라 전용 input
  const galleryInputRef = useRef(null);  // 앨범 전용 input

  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCameraClick = () => {
    if (!loading) {
      cameraInputRef.current?.click();
    }
  };

  const handleGalleryClick = () => {
    if (!loading) {
      galleryInputRef.current?.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 선택해 주세요.");
      return;
    }

    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      if (onImageChange) onImageChange(reader.result);
    };
    reader.readAsDataURL(file);

    if (onFileSelected) onFileSelected(file);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await apiClient.post(
        "/services/dietanalyzer/analyze",
        formData,
      );
      setResult(data);
      if (onAnalyzeSuccess && data) {
        await onAnalyzeSuccess(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "분석에 실패했습니다.");
    } finally {
      setLoading(false);
      // 같은 input에서 다시 선택 가능하도록 value 초기화
      e.target.value = "";
    }
  };

  return (
    <div
      className={
        containerClassName ||
        "sect2_cont w-[50%] flex flex-col justify-center items-center"
      }
    >
      <h2
        className={
          titleClassName ||
          "!text-base md:!text-lg lg:!text-xl xl:!text-2xl text-white"
        }
      >
        오늘 먹은 음식은 몇 칼로리일까요?
      </h2>

      <div className="w-[250px] h-[250px] border border-white/50 bg-gray-200 rounded-[20px] mt-5 overflow-hidden flex items-center justify-center">
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="식단 미리보기"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-sm">이미지를 선택해 주세요</span>
        )}
      </div>

      {/* 카메라 전용 input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        disabled={loading}
      />

      {/* 앨범(갤러리) 전용 input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={loading}
      />

      {/* 버튼 영역: 카메라 / 앨범 선택 - 세로 정렬 */}
      <div className="w-full md:w-1/2 mt-2 flex flex-col gap-2">
        <BtnComp
          variant="line"
          size="long"
          type="button"
          onClick={handleCameraClick}
          className="flex-1 md:hidden"
          disabled={loading}
        >
          {loading ? "분석 중..." : "카메라로 음식 촬영"}
        </BtnComp>

        <BtnComp
          variant="line"
          size="long"
          type="button"
          onClick={handleGalleryClick}
          className="flex-1"
          disabled={loading}
        >
          {loading ? "분석 중..." : "앨범에서 음식 사진 선택"}
        </BtnComp>
      </div>

      {error && <p className="mt-3 text-red-200 text-sm">{error}</p>}

      {showResult && result && result.status === "SUCCESS" && (
        <div
          className={`mt-4 text-center ${resultTextClassName || "text-white"}`}
        >
          <p className="text-lg font-semibold">
            총 칼로리:{" "}
            <span className="text-main-02">{result.calories ?? 0}</span> kcal
          </p>
          {result.food_name && (
            <p className="text-sm mt-1 opacity-90">{result.food_name}</p>
          )}
          {result.evaluation && (
            <p className="text-sm mt-2 opacity-80 max-w-md">
              {result.evaluation}
            </p>
          )}
        </div>
      )}

      {showResult && result && result.status === "NO_FOOD_DETECTED" && (
        <div
          className={`mt-4 text-center ${resultTextClassName || "text-white"}`}
        >
          <p className="text-lg font-semibold">
            사진에서 분석할 음식이 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}

export default MealAnal;