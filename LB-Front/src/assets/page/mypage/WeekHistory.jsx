import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "../../../components/ChartComp";
import BtnComp from "../../../components/BtnComp";
import PageNatation from "../../../components/PageNatation";
import usePaginationStore from "../../../stores/paginationStore";
import { getWeekHistoryAll, addWeekHistory, updateWeekHistory, deleteWeekHistory } from "../../../api/WeekHistory";

// 페이지당 카드 수
const PAGE_SIZE = 4;

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
];

const STORE_KEY = "week-history";

function WeekHistory() {
  const navigate = useNavigate();

  const [sortOrder, setSortOrder] = useState("latest");
  const [weightList, setWeightList] = useState([]);

  // 입력
  const [date, setDate] = useState("");
  const [weight, setWeight] = useState("");

  // 모달 관련 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingWeight, setEditingWeight] = useState("");

  const pagination = usePaginationStore((state) => state.paginations[STORE_KEY]);
  const resetPagination = usePaginationStore((state) => state.resetPagination);
  const currentPage = pagination?.currentPage ?? 0;

  // 조회
  const fetchWeekHistory = async () => {
    try {
      const data = await getWeekHistoryAll();
      setWeightList(data);
    } catch (error) {
      console.error("조회 실패", error);
    }
  };

  useEffect(() => {
    fetchWeekHistory();
  }, []);

  // 정렬 변경 시 첫 페이지로 리셋
  useEffect(() => {
    resetPagination(STORE_KEY);
  }, [sortOrder, resetPagination]);

  // 정렬 처리
  const sortedList = useMemo(() => {
    const list = [...weightList];
    return sortOrder === "latest"
      ? list.sort((a, b) => new Date(b.date) - new Date(a.date))
      : list.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [sortOrder, weightList]);

  const totalElements = sortedList.length;

  const currentPageItems = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return sortedList.slice(start, start + PAGE_SIZE);
  }, [currentPage, sortedList]);

  const handlePageChange = () => {};

  // 차트 데이터 생성
  const chartData = useMemo(() => {
    return {
      labels: sortedList.map((item) => item.date),
      datasets: [
        {
          label: "체중(kg)",
          data: sortedList.map((item) => item.weight),
          borderColor: "#4ade80",
          backgroundColor: "rgba(74, 222, 128, 0.3)",
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [sortedList]);

  // 안내 문구 계산
  const statusText = useMemo(() => {
    if (!sortedList.length) return "체중 기록이 없습니다.";

    const latestWeight = sortedList[0].weight;
    const lastWeekWeight = sortedList[1]?.weight ?? latestWeight;
    const diff = latestWeight - lastWeekWeight;

    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    const lastMonthRecords = sortedList.filter((item) => new Date(item.date) >= oneMonthAgo);
    const maxWeight = Math.max(...lastMonthRecords.map((item) => item.weight));
    const minWeight = Math.min(...lastMonthRecords.map((item) => item.weight));

    let text = "";

    // 지난주 대비
    if (diff > 0) text += `지난주보다 ${diff.toFixed(1)}kg 증가하였습니다. `;
    else if (diff < 0) text += `지난주보다 ${Math.abs(diff).toFixed(1)}kg 감소하였습니다. `;
    else text += "지난주와 체중이 동일합니다. ";

    // 최근 1개월 최고/최저
    if (latestWeight >= maxWeight) text += "최근 1개월 동안 최고 체중입니다. ";
    else if (latestWeight <= minWeight) text += "최근 1개월 동안 최저 체중입니다. ";

    // 운동/식사 안내
    if (diff > 0) text += "운동량을 늘리고 식사량을 조절하세요.";
    else if (diff < 0) text += "체중이 줄었으니 식사량을 체크하세요.";
    else text += "현재 체중을 유지하세요.";

    return text;
  }, [sortedList]);

  // 저장
  const handleSave = async () => {
    if (!date || !weight) {
      alert("날짜와 체중을 입력하세요.");
      return;
    }
    const confirmSave = window.confirm("저장하시겠습니까?");
    if (!confirmSave) return;
    try {
      await addWeekHistory({ date, weight: parseFloat(weight) });
      setDate("");
      setWeight("");
      fetchWeekHistory();
    } catch (error) {
      console.error("저장 실패", error);
    }
  };

  // 삭제
  const handleDelete = async (item) => {
    if (window.confirm(`"${item.date}" 기록을 삭제할까요?`)) {
      try {
        await deleteWeekHistory(item.id);
        fetchWeekHistory();
      } catch (error) {
        console.error("삭제 실패", error);
      }
    }
  };

  // 모달 열기
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditingWeight(item.weight);
    setEditModalOpen(true);
  };

  return (
    <>
      <div className="wrap">
        <section className="">
          <div className="containers mx-auto text-center">
            <h3 className="text-deep text-base md:text-lg lg:text-xl xl:text-2xl">
              <i className="fa-solid fa-weight-scale mr-5" />
              나의 주간 체중 기록
            </h3>
            <hr className=" mt-[4%] border-t-10 border-main-02 my-4" />
            <div className="  flex justify-center mb-10">
              <span className=" mt-[5%] inline-flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-1 rounded-full ">
                <i className="fa-solid fa-calendar-days mr-2"></i>
                주간 체중 기록
              </span>
            </div>
            <div className=" w-[390px] h-[160px] bg-light-02 mx-auto flex items-center justify-center text-center px-4">
              <p className="text-sm text-deep leading-relaxed">{statusText}</p>
            </div>
            <div className="w-full max-w-[520px] mx-auto mt-[10%] ">
              <Chart
                type="line"
                data={chartData}
                options={{
                  plugins: { title: { display: false } },
                  responsive: true,
                }}
              />
            </div>
            <hr className=" mt-[5%] border-t-10 border-main-02 my-4" />
          </div>
        </section>

        {/* 나머지 UI는 기존 코드 그대로 */}
        <section className="mt-[5%]">
          <div className="  flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-main-02 text-white text-sm px-4 py-1 rounded-full">
              <i className="fa-solid fa-calendar-days mr-2"></i>
              체중 기록 수정
            </span>
          </div>

          <div className=" !w-[70%] mx-auto rounded-[20px] p-10 bg-white shadow-lg">
            <h3 className="text-xl font-semibold text-center pt-10 mb-10">체중 기록 변화를 입력하세요</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-[900px]  mx-auto mb-10">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">날짜</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-main-02 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-main-02"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">체중</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="kg"
                  className="w-full border border-main-02 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-main-02"
                />
              </div>
            </div>

            <div className="flex  justify-center  w-[300px] min-w-[80px] mx-auto gap-10">
              <BtnComp
                size="short"
                variant="primary"
                className=" w-[150px] px-6 py-3 text-base md:text-lg rounded-lg"
                onClick={handleSave}
              >
                저장
              </BtnComp>
              <BtnComp
                size="short"
                variant="primary"
                className=" w-[150px] px-6 py-3 bg-gray-deep text-base md:text-lg rounded-lg"
                onClick={() => {
                  setDate("");
                  setWeight("");
                }}
              >
                취소
              </BtnComp>
            </div>
          </div>
        </section>

        {/* 기록 리스트 */}
        <section className="mt-[5%] ">
          <div className="containers mx-auto px-4">
            <hr className=" my-[5%] border-t-10 border-main-02 my-4" />
            <h3 className="text-deep text-base md:text-lg lg:text-xl xl:text-2xl text-center">
              <i className="fa-solid fa-weight-scale mr-5" />
              나의 주간 체중 기록 리스트
            </h3>

            <div className="flex flex-wrap items-center justify-end gap-2 mt-6 mb-6">
              <span className="text-sm font-medium text-deep">정렬</span>
              <span className="material-icons !text-[30px]">sort</span>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSortOrder(opt.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    sortOrder === opt.value
                      ? "bg-main-02 text-white"
                      : "bg-light-02 text-main-02 border border-main-02 hover:bg-light-01"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="wrap !mt-0 mb-[5%]">
              <div className="flex w-full flex-wrap justify-evenly max-w-[1600px] mx-auto">
                {currentPageItems.map((item) => (
                  <article
                    key={item.id}
                    className="bg-light-02 border border-main-02 rounded-xl p-5 flex flex-col mt-2.5 w-full sm:w-full md:w-[45%] lg:w-[22%]"
                  >
                    <p className="text-deep text-sm mb-2">{item.date}</p>
                    <p className="text-deep text-base mb-4">
                      나의 체중 : <span className="text-main-02 font-semibold">{item.weight}kg</span>
                    </p>
                    <div className="flex gap-2 mt-auto">
                      <BtnComp
                        size="short"
                        variant="primary"
                        className="flex-1 py-2 text-sm rounded-lg"
                        onClick={() => openEditModal(item)}
                      >
                        수정
                      </BtnComp>
                      <BtnComp
                        size="short"
                        variant="primary"
                        className="flex-1 py-2 text-sm rounded-lg bg-gray-deep hover:opacity-90"
                        onClick={() => handleDelete(item)}
                      >
                        삭제
                      </BtnComp>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="flex justify-center pb-[10%]">
              <PageNatation
                storeKey={STORE_KEY}
                totalElements={totalElements}
                pageSize={PAGE_SIZE}
                pageFn={handlePageChange}
              />
            </div>
          </div>
        </section>

        {/* 수정 모달 */}
        {editModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          >
            <div className="bg-white p-5 rounded-xl shadow-lg w-[280px] sm:w-[300px]">
              {/* 제목 */}
              <h3 className="!text-[22px] font-medium mb-2 text-center text-deep">"{editingItem.date}" 기록 수정</h3>

              {/* 체중 입력 */}
              <input
                type="number"
                value={editingWeight}
                onChange={(e) => setEditingWeight(e.target.value)}
                className="w-full border border-main-02 rounded-md px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-main-02"
                placeholder="체중 입력 (kg)"
              />

              {/* 버튼 */}
              <div className="flex justify-between gap-3">
                <BtnComp
                  size="short"
                  variant="primary"
                  className="flex-1 py-2 text-sm"
                  onClick={async () => {
                    if (!editingWeight) {
                      alert("체중을 입력해주세요.");
                      return;
                    }

                    const confirmSave = window.confirm("정말 저장하시겠습니까?");
                    if (!confirmSave) return;

                    try {
                      await updateWeekHistory(editingItem.id, {
                        date: editingItem.date,
                        weight: parseFloat(editingWeight),
                      });
                      setEditModalOpen(false);
                      fetchWeekHistory();
                    } catch (error) {
                      console.error("수정 실패", error);
                    }
                  }}
                >
                  저장
                </BtnComp>

                <BtnComp
                  size="short"
                  variant="primary"
                  className="flex-1 py-2 text-sm bg-gray-deep"
                  onClick={() => {
                    const confirmCancel = window.confirm("정말 취소하시겠습니까?");
                    if (confirmCancel) setEditModalOpen(false);
                  }}
                >
                  취소
                </BtnComp>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default WeekHistory;
