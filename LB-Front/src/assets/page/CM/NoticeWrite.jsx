import { useEffect, useMemo, useRef, useState } from "react";
import BtnComp from "../../../components/BtnComp";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useClubStore } from "../../../api/ClubData";
import { useAuthStore } from "../../../stores/authStore";
import { useBoardsStore } from "../../../api/BoardsData";
import { BASE_URL } from "../../../api/config";
import usePaginationStore from "../../../stores/paginationStore";

function NoticeWrite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get("boardId");
  const isEditMode = !!boardId;

  // 클럽 / 유저 / 게시판 스토어
  const { clubs, fetchClubs } = useClubStore();
  const user = useAuthStore((state) => state.user);
  const { createBoard, updateBoard, fetchBoardDetail, boardDetail } = useBoardsStore();
  const resetPagination = usePaginationStore((state) => state.resetPagination);

  // 내가 매니저인 클럽들만 필터링 (공지사항은 매니저 클럽 기준으로 작성)
  const myManagedClubs = useMemo(() => {
    if (!user?.id || !Array.isArray(clubs)) return [];
    return clubs.filter((club) => club.managerId === user.id);
  }, [clubs, user]);

  const managedClub = myManagedClubs[0];
  const clubName = managedClub?.name || "";
  const clubId = managedClub?.id;

  // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayString = `${year}-${month}-${day}`;

  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // 클럽 리스트 로드 (ClubPostWrite 패턴 참고)
  useEffect(() => {
    const loadClubs = async () => {
      try {
        await fetchClubs();
      } catch (err) {
        console.error("클럽 리스트 로드 실패:", err);
      }
    };
    loadClubs();
  }, [fetchClubs]);

  // 수정 모드일 때 기존 게시글 데이터 로드
  useEffect(() => {
    const loadBoardDetail = async () => {
      if (isEditMode && boardId) {
        try {
          await fetchBoardDetail(boardId);
        } catch (err) {
          console.error("게시글 상세 데이터 로드 실패:", err);
        }
      }
    };
    loadBoardDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, isEditMode]);

  // 수정 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (isEditMode && boardDetail) {
      setTitle(boardDetail.title || "");
      setContents(boardDetail.contents || "");
      if (boardDetail.filename) {
        setPreview(`${BASE_URL}/file/${boardDetail.filename}`);
      }
    }
  }, [isEditMode, boardDetail]);

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

  /* 공지사항 저장/수정 (board_type = 2 고정) */
  const handleSave = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!contents.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    if (!clubId) {
      alert("공지사항을 등록할 클럽이 없습니다.");
      return;
    }
    if (!user?.id) {
      alert("로그인이 필요합니다.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("contents", contents.trim());
      // BoardsData 매핑에 맞춰 boardType 사용, 공지사항이므로 항상 2
      formData.append("boardType", "2");

      // 파일이 있으면 추가 (수정 모드에서 새 파일로 교체)
      if (imageFile) {
        formData.append("file", imageFile);
      }

      let response;
      if (isEditMode && boardId) {
        // 수정 모드
        response = await updateBoard(boardId, formData);
        alert("수정이 완료되었습니다.");
        resetPagination("cm-join-list"); // 페이지네이션 초기화
        navigate("/CMManagement/noticemanagement");
      } else {
        // 작성 모드
        formData.append("clubId", clubId);
        formData.append("memberName", user.name || "");
        response = await createBoard(formData);
        alert("작성이 완료되었습니다.");
        resetPagination("cm-join-list"); // 페이지네이션 초기화
        navigate("/CMManagement/noticemanagement");
      }
    } catch (err) {
      console.error(isEditMode ? "공지사항 수정 실패:" : "공지사항 저장 실패:", err);
      alert(
        err?.response?.data?.message || (isEditMode ? "공지사항 수정에 실패했습니다." : "공지사항 저장에 실패했습니다.")
      );
    } finally {
      setLoading(false);
    }
  };

  //취소
  const handleCsl = () => {
    if (isEditMode && boardId && clubId) {
      // 수정 모드: 원래 게시글 상세 페이지로 이동
      alert("수정이 취소되었습니다.");
      navigate(`/club/detail/${clubId}/postlist/posting/${boardId}`);
    } else {
      // 작성 모드: 공지사항 관리 페이지로 이동
      alert("작성이 취소되었습니다.");
      navigate("/CMManagement/noticemanagement");
    }
  };

  return (
    <>
      <div className="wrap !mt-0 !bg-light-02">
        <div className="containers w-full sm:!w-[70%]">
          {/* write title */}
          <section className="wr_tit text-black py-[10px] mt-[50px] border-b border-b-[1px] border-b-deep">
            <div className="flex flex-row  items-center text-deep">
              <i className="fa-solid fa-file-pen"></i>
              <span className="ml-1">{clubName} 모임</span>
            </div>
            <h3>{isEditMode ? "공지사항 수정" : "공지사항 작성"}</h3>
          </section>

          {/* 입력 폼 */}
          <section className=" w-full py-8">
            {/* 제목 */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border  border-deep rounded px-3 h-[35px] bg-white"
                placeholder="제목을 입력하세요"
              />
            </div>

            {/* 작성일자 */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold">작성일자</label>
              <span className="text-black">{todayString}</span>
            </div>

            {/* 이미지 첨부 */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold">파일 첨부</label>
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
                    disabled={loading}
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

            {/* 내용 */}
            <div className="mb-8">
              <label className="block mb-2 font-semibold">내용</label>
              <textarea
                value={contents}
                onChange={(e) => setContents(e.target.value)}
                className="w-full h-100 border  border-deep rounded p-3 bg-white"
                placeholder="내용을 입력하세요"
                rows={10}
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
                {loading ? (isEditMode ? "수정 중..." : "저장 중...") : (isEditMode ? "수정" : "저장")}
              </BtnComp>

              <BtnComp
                variant="point"
                size="short"
                className="!w-[48%] !mt-0 !h-[35px] !text-xs md:!text-sm btn_can"
                onClick={handleCsl}
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

export default NoticeWrite;
