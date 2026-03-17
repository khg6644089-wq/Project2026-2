import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BtnComp from "../../../components/BtnComp";
import { apiClient } from "../../../api/config";
import { GOAL_OPTIONS, ALLERGY_OPTIONS } from "../../../constants/member";
import ChangePassword from "./ChangePassword";
import ProfileImage from "./ProfileImage";

/** 내 정보 조회 (GET /me) */
const getMe = async () => {
  const response = await apiClient.get("/me");
  return response.data;
};

/** 내 정보 수정 (PUT /me) - email, password 제외 */
const updateMe = async (requestData) => {
  const response = await apiClient.put("/me", requestData);
  return response.data;
};

const emptyForm = {
  name: "",
  phone: "",
  gender: "M",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
  height: "",
  weight: "",
  target_date: "",
  goal: "체중감량",
  goal_weight: "",
  selectedAllergies: [],
  special_notes: "",
};

function MyInfo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await getMe();
        if (data.birthday) {
          const [y, m, d] = data.birthday.split("-");
          setFormData({
            name: data.name ?? "",
            phone: data.phone ?? "",
            gender: data.gender ?? "M",
            birthYear: y ?? "",
            birthMonth: m ?? "",
            birthDay: d ?? "",
            height: data.height != null ? String(data.height) : "",
            weight: data.weight != null ? String(data.weight) : "",
            target_date:
              data.target_date != null ? String(data.target_date) : "",
            goal: data.goal ?? "체중감량",
            goal_weight:
              data.goal_weight != null ? String(data.goal_weight) : "",
            selectedAllergies: data.allergies
              ? data.allergies.split(",").filter(Boolean)
              : [],
            special_notes: data.special_notes ?? "",
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            name: data.name ?? "",
            phone: data.phone ?? "",
            gender: data.gender ?? "M",
            height: data.height != null ? String(data.height) : "",
            weight: data.weight != null ? String(data.weight) : "",
            target_date:
              data.target_date != null ? String(data.target_date) : "",
            goal: data.goal ?? "체중감량",
            goal_weight:
              data.goal_weight != null ? String(data.goal_weight) : "",
            selectedAllergies: data.allergies
              ? data.allergies.split(",").filter(Boolean)
              : [],
            special_notes: data.special_notes ?? "",
          }));
        }
      } catch (err) {
        console.error("내 정보 조회 실패:", err);
        setErrors({
          submit:
            err.response?.data?.message || "내 정보를 불러오지 못했습니다.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleAllergyClick = (allergy) => {
    setFormData((prev) => ({
      ...prev,
      selectedAllergies: prev.selectedAllergies.includes(allergy)
        ? prev.selectedAllergies.filter((a) => a !== allergy)
        : [...prev.selectedAllergies, allergy],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const {
      name,
      phone,
      height,
      weight,
      goal_weight,
      target_date,
      birthYear,
      birthMonth,
      birthDay,
    } = formData;

    if (!name?.trim()) newErrors.name = "이름을 입력해주세요.";

    if (!birthYear) {
      newErrors.birthYear = "생년월일을 모두 입력해주세요.";
    } else if (!birthMonth) {
      newErrors.birthMonth = "생년월일을 모두 입력해주세요.";
    } else if (!birthDay) {
      newErrors.birthDay = "생년월일을 모두 입력해주세요.";
    } else {
      const y = parseInt(birthYear);
      const m = parseInt(birthMonth);
      const d = parseInt(birthDay);
      const dateCheck = new Date(y, m - 1, d);
      const isValidDate =
        dateCheck.getFullYear() === y &&
        dateCheck.getMonth() === m - 1 &&
        dateCheck.getDate() === d;
      if (!isValidDate) {
        newErrors.birthYear = "유효하지 않은 날짜입니다.";
      } else if (dateCheck > new Date()) {
        newErrors.birthYear = "미래 날짜는 선택할 수 없습니다.";
      }
    }

    if (!phone?.trim()) newErrors.phone = "휴대폰 번호를 입력해주세요.";
    if (!height) newErrors.height = "키를 입력해주세요.";
    if (!weight) newErrors.weight = "몸무게를 입력해주세요.";
    if (!goal_weight) newErrors.goal_weight = "목표 몸무게를 입력해주세요.";
    if (!target_date) newErrors.target_date = "목표 기간을 입력해주세요.";
    if (target_date) {
      const targetDateNum = parseInt(target_date);
      if (isNaN(targetDateNum) || targetDateNum < 30 || targetDateNum > 180) {
        newErrors.target_date =
          "목표 기간은 30일에서 180일 사이로 입력해주세요.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = Object.keys(newErrors)[0];
      document.getElementsByName(firstErrorField)[0]?.focus();
      return;
    }

    try {
      setErrors({});
      const requestData = {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        birthday: `${formData.birthYear}-${formData.birthMonth.padStart(2, "0")}-${formData.birthDay.padStart(2, "0")}`,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        target_date: parseInt(formData.target_date),
        goal: formData.goal,
        goal_weight: parseFloat(formData.goal_weight),
        allergies: formData.selectedAllergies.join(","),
        special_notes: formData.special_notes,
      };
      await updateMe(requestData);
      alert("내 정보가 수정되었습니다.");
      navigate("/mypage");
    } catch (err) {
      console.error("내 정보 수정 실패:", err);
      setErrors({
        submit: err.response?.data?.message || "수정 중 오류가 발생했습니다.",
      });
    }
  };

  if (loading) {
    return (
      <div className="wrap bg-light-03 min-h-screen flex items-center justify-center">
        <p className="text-deep">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="wrap min-h-screen !mt-0  !bg-light-02">
      <div className="containers ">
        <div className="w-full max-w-lg mx-auto py-20">
          <div className="flex flex-row items-center justify-center gap-2 mb-10">
            <ProfileImage />
            <h4 className="text-2xl font-bold leading-none text-deep m-0">
              내 정보 수정
            </h4>
          </div>

          <form onSubmit={handleSubmit} noValidate className="w-full space-y-5">
            {errors.submit && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                {errors.submit}
              </div>
            )}

            <div className="space-y-1">
              <input
                type="text"
                name="name"
                placeholder="이름"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md bg-white text-black ${
                  errors.name ? "border-red-500" : "border-main-02"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs px-1">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  name="birthYear"
                  placeholder="년(4자)"
                  value={formData.birthYear}
                  onChange={handleChange}
                  className={`flex-1 min-w-[120px] p-3 border rounded-md bg-white ${
                    errors.birthYear || errors.birthMonth || errors.birthDay
                      ? "border-red-500"
                      : "border-main-02"
                  }`}
                />
                <input
                  type="text"
                  name="birthMonth"
                  placeholder="월"
                  value={formData.birthMonth}
                  onChange={handleChange}
                  className={`w-20 sm:w-24 p-3 border rounded-md bg-white ${
                    errors.birthYear || errors.birthMonth || errors.birthDay
                      ? "border-red-500"
                      : "border-main-02"
                  }`}
                />
                <input
                  type="text"
                  name="birthDay"
                  placeholder="일"
                  value={formData.birthDay}
                  onChange={handleChange}
                  className={`w-20 sm:w-24 p-3 border rounded-md bg-white ${
                    errors.birthYear || errors.birthMonth || errors.birthDay
                      ? "border-red-500"
                      : "border-main-02"
                  }`}
                />
              </div>
              {(errors.birthYear || errors.birthMonth || errors.birthDay) && (
                <p className="text-red-500 text-xs px-1">
                  {errors.birthYear || errors.birthMonth || errors.birthDay}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <input
                type="text"
                name="phone"
                placeholder="휴대폰번호"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md bg-white ${
                  errors.phone ? "border-red-500" : "border-main-02"
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs px-1">{errors.phone}</p>
              )}
            </div>

            <div className="flex items-center gap-6 py-2 text-deep font-bold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="M"
                  checked={formData.gender === "M"}
                  onChange={handleChange}
                  className="accent-main-02"
                />
                남
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="F"
                  checked={formData.gender === "F"}
                  onChange={handleChange}
                  className="accent-main-02"
                />
                여
              </label>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  name="height"
                  placeholder="키(cm)"
                  value={formData.height}
                  onChange={handleChange}
                  className={`p-3 border rounded-md bg-white ${
                    errors.height ? "border-red-500" : "border-main-02"
                  }`}
                />
                <input
                  type="number"
                  name="weight"
                  placeholder="몸무게(kg)"
                  value={formData.weight}
                  onChange={handleChange}
                  className={`p-3 border rounded-md bg-white ${
                    errors.weight ? "border-red-500" : "border-main-02"
                  }`}
                />
                <input
                  type="number"
                  name="goal_weight"
                  placeholder="목표(kg)"
                  value={formData.goal_weight}
                  onChange={handleChange}
                  className={`p-3 border rounded-md bg-white ${
                    errors.goal_weight ? "border-red-500" : "border-main-02"
                  }`}
                />
              </div>
              {(errors.height || errors.weight || errors.goal_weight) && (
                <p className="text-red-500 text-xs px-1">
                  {errors.height || errors.weight || errors.goal_weight}
                </p>
              )}
            </div>

            <div>
              <p className="font-bold text-deep mb-3 flex items-center gap-1">
                가입 목적 ✓
              </p>
              <div className="flex gap-2 flex-wrap">
                {GOAL_OPTIONS.map((g) => (
                  <BtnComp
                    key={g}
                    type="button"
                    size="short"
                    variant={formData.goal === g ? "primary" : "line"}
                    className={`mt-0 h-[36px] w-auto px-2 sm:px-4 border-none text-xs sm:text-sm ${
                      formData.goal === g
                        ? "bg-deep"
                        : "bg-main-02 text-white hover:bg-main-01"
                    }`}
                    onClick={() => setFormData((p) => ({ ...p, goal: g }))}
                  >
                    {g}
                  </BtnComp>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-deep mb-2 flex items-center gap-1">
                목표 기간{" "}
                <span className="material-icons text-sm">calendar_today</span>
              </p>
              <input
                min="30"
                max="180"
                type="number"
                name="target_date"
                value={formData.target_date}
                placeholder="목표 기간 (30~180일)"
                onChange={handleChange}
                className={`w-full p-3 border rounded-md bg-white ${
                  errors.target_date ? "border-red-500" : "border-main-02"
                }`}
              />
              {errors.target_date && (
                <p className="text-red-500 text-xs px-1">
                  {errors.target_date}
                </p>
              )}
            </div>

            <div>
              <p className="font-bold text-deep mb-3 flex items-center gap-1">
                알러지 여부 체크 ✓
              </p>
              <div className="grid grid-cols-4 gap-2">
                {ALLERGY_OPTIONS.map((a) => (
                  <BtnComp
                    key={a}
                    type="button"
                    size="short"
                    variant={
                      formData.selectedAllergies.includes(a)
                        ? "primary"
                        : "line"
                    }
                    className={`mt-0 h-[36px] w-full border-none ${
                      formData.selectedAllergies.includes(a)
                        ? "bg-deep"
                        : "bg-main-02 text-white hover:bg-main-01"
                    }`}
                    onClick={() => handleAllergyClick(a)}
                  >
                    {a}
                  </BtnComp>
                ))}
              </div>
            </div>

            <textarea
              name="special_notes"
              placeholder="특이사항"
              value={formData.special_notes}
              onChange={handleChange}
              className="w-full p-3 border border-main-02 rounded-md h-24 bg-white"
            />

            <div className="mt-1!important flex gap-2">
              <BtnComp
                type="button"
                size="long"
                variant="line"
                className="flex-1"
                onClick={() => navigate("/mypage")}
              >
                취소
              </BtnComp>
              <BtnComp
                size="long"
                variant="primary"
                type="submit"
                className="flex-1"
              >
                저장
              </BtnComp>
            </div>
          </form>

          <div className="w-full max-w-lg mx-auto pt-4 mb-10">
            <ChangePassword />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyInfo;
