import { useState, useRef } from "react";
import BtnComp from "../../../components/BtnComp";
import { useNavigate } from "react-router-dom";
import { useClubDetailStore } from "../../../api/ClubDetailData";
import { useAuthStore } from "../../../stores/authStore";
import { useMyClubStore } from "../../../api/MyClubData";

function CMopen() {
  // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayString = `${year}-${month}-${day}`;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { createClub } = useClubDetailStore();
  const user = useAuthStore((state) => state.user);
  const { fetchMyClubs } = useMyClubStore();

  // 클럽 생성
  const handleSave = async () => {
    // 유효성 검사
    if (!name.trim()) {
      alert("클럽 이름을 입력해주세요.");
      return;
    }
    if (!description.trim()) {
      alert("소개글을 입력해주세요.");
      return;
    }
    if (keywords.length < 1 || keywords.length > 5) {
      alert("키워드는 1개 이상 5개 이하로 입력해주세요.");
      return;
    }
    if (!imageFile) {
      alert("배경 이미지를 선택해주세요.");
      return;
    }
    if (!user?.id) {
      alert("로그인이 필요합니다.");
      return;
    }

    setLoading(true);

    try {
      // FormData로 모든 데이터를 함께 전송
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("keywords", keywords.join(","));
      formData.append("file", imageFile);
      formData.append("manager_id", user.id);

      await createClub(formData);
      // 클럽 생성 성공 후 마이클럽 데이터 다시 조회
      await fetchMyClubs();
      alert("클럽이 개설되었습니다");
      navigate("/CMmanagement");
    } catch (err) {
      console.error("클럽 생성 실패:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "클럽 생성에 실패했습니다.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* 키워드 처리 */
  const handleKeywordChange = (e) => {
    setKeywordInput(e.target.value);
  };

  const addKeywords = () => {
    if (!keywordInput.trim()) return;

    const newKeywords = keywordInput
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const merged = [...keywords, ...newKeywords].slice(0, 5);
    setKeywords(merged);
    setKeywordInput("");
  };

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  /* 이미지 처리 */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="wrap !mt-0 !bg-light-02">
        <div className="containers w-full sm:!w-[70%]">
          {/* write title */}
          <section className="wr_tit text-black py-[10px] mt-[50px] border-b border-b-[1px] border-b-deep">
            <div className="flex flex-row  items-center text-deep">
              <i class="fa-solid fa-file-pen"></i>
              <span>커뮤니티 개설</span>
            </div>
            <h3>커뮤니티 개설</h3>
          </section>

          {/* 입력 폼 */}
          <section className=" w-full py-8">
            {/* 클럽 이름 */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold">클럽 이름</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border  border-deep rounded px-3 h-[35px] bg-white"
                placeholder="클럽 이름을 입력해주세요"
              />
            </div>

            {/* 작성일자 */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold">작성일자</label>
              <span className="text-black">{todayString}</span>
            </div>

            {/* 배경 이미지 */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold">배경이미지</label>
              <div className="flex gap-2 items-center">
                {/* 선택된 파일 표시 인풋박스 */}
                <input
                  type="text"
                  readOnly
                  value={imageFile ? imageFile.name : "선택된 파일 없음"}
                  className={`flex-1 border border-deep rounded px-3 h-[35px] min-w-[255px] bg-white ${
                    !imageFile ? "text-gray-deep" : ""
                  }`}
                />

                {/* 파일 선택 버튼 */}
                <div className="w-[200px] min-w-[80px] flex items-center justify-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleImageChange}
                    className="hidden "
                  />
                  <BtnComp
                    size="mid"
                    variant="primary"
                    className="mt-0 !h-[35px] w-full "
                    onClick={handleFileButtonClick}
                  >
                    파일 선택
                  </BtnComp>
                </div>
              </div>

              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="mt-4 w-32 h-32 object-cover rounded border"
                />
              )}
            </div>

            {/* 키워드 */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold">키워드</label>

              <div className="flex gap-2 items-center">
                <input
                  value={keywordInput}
                  onChange={handleKeywordChange}
                  placeholder="키워드를 , 로 구분하여 입력해주세요"
                  className="flex-1 border  border-deep rounded px-3 h-[35px] bg-white min-w-[255px]"
                />

                <div
                  className=" w-[200px] min-w-[80px] flex items-center justify-center"
                  onClick={addKeywords}
                >
                  <BtnComp
                    size="mid"
                    variant="primary"
                    className="mt-0 !h-[35px] w-full "
                  >
                    추가
                  </BtnComp>
                </div>
              </div>

              {/* 키워드 표시 */}
              <div className="flex gap-2 flex-wrap my-5">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 bg-green-600 text-white px-3 py-1  rounded-full !text-sm"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(index)}
                      className="text-xs ml-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <p className="text-sm text-gray-500 mt-1">
                최대 5개까지 입력 가능합니다.
              </p>
            </div>

            {/* 소개글 */}
            <div className="mb-8">
              <label className="block mb-2 font-semibold">소개글</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-40 border  border-deep rounded p-3 bg-white"
                placeholder="클럽 소개글을 입력해주세요"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 mt-2 w-[50%] mx-auto py-[5%]">
              <BtnComp
                variant="primary"
                size="short"
                className="!w-[48%] !mt-0 !h-[35px] !text-xs md:!text-sm btn_save  "
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "저장 중..." : "저장"}
              </BtnComp>

              <BtnComp
                variant="point"
                size="short"
                className="!w-[48%] !mt-0 !h-[35px] !text-xs md:!text-sm btn_can"
                onClick={() => navigate("/CMmanagement")}
                disabled={loading}
              >
                취소
              </BtnComp>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default CMopen;
