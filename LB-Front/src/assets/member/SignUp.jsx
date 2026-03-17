import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import BtnComp from "../../components/BtnComp";
import { checkEmailAvailability, callSignUp } from "../../api/auth";
import { GOAL_OPTIONS, ALLERGY_OPTIONS } from "../../constants/member";

function SignUp() {
  const navigate = useNavigate();
  const emailCheckBtnRef = useRef(null); // 중복 체크 버튼 ref
  const [isEmailChecked, setIsEmailChecked] = useState(false); // 중복 체크 여부 상태
  const [errors, setErrors] = useState({}); // 에러 메시지 상태 추가
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
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
  });

  // 중복 확인 버튼 핸들러
  const handleEmailCheck = async () => {
    if (!formData.email) {
      alert("이메일을 입력해 주세요.");
      return;
    }
    try {
      const isExist = await checkEmailAvailability(formData.email);
      if (isExist) {
        alert("이미 사용 중인 이메일입니다.");
        setIsEmailChecked(false);
      } else {
        alert("사용 가능한 이메일입니다.");
        setIsEmailChecked(true);
      }
    } catch (error) {
      alert("중복 체크에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 입력 시 해당 필드의 에러 메시지 초기화
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    if (name === "email") setIsEmailChecked(false); // 이메일 수정 시 중복체크 다시 하도록 초기화
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

    // 1. 이메일 중복 체크 확인
    if (!isEmailChecked) {
      newErrors.email = "이메일 중복 체크를 완료해주세요.";
    }

    // 2. 비밀번호 일치 확인
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }

    // 3. 필수 입력 항목 검사
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

    if (!name.trim()) newErrors.name = "이름을 입력해주세요.";

    // 4. 생년월일 유효성 검사 (순서 조정: 이름 다음)
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

    if (!phone.trim()) newErrors.phone = "휴대폰 번호를 입력해주세요.";
    if (!height) newErrors.height = "키를 입력해주세요.";
    if (!weight) newErrors.weight = "몸무게를 입력해주세요.";
    if (!goal_weight) newErrors.goal_weight = "목표 몸무게를 입력해주세요.";
    if (!target_date) newErrors.target_date = "목표 기간을 입력해주세요.";

    // 5. 목표 기간 유효성 검사 (30일 ~ 180일)
    if (target_date) {
      const targetDateNum = parseInt(target_date);
      if (isNaN(targetDateNum) || targetDateNum < 30 || targetDateNum > 180) {
        newErrors.target_date =
          "목표 기간은 30일에서 180일 사이로 입력해주세요.";
      }
    }

    // 에러가 있으면 중단
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // 첫 번째 에러 필드로 스크롤 (선택 사항)
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      element?.focus();
      return;
    }

    try {
      const requestData = {
        email: formData.email,
        password: formData.password,
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

      await callSignUp(requestData);
      alert("회원가입이 완료되었습니다.");
      navigate("/member/signin");
    } catch (error) {
      console.error("회원가입 오류:", error);
      alert(
        error.response?.data?.message || "회원가입 중 오류가 발생했습니다.",
      );
    }
  };

  return (
    <div className="wrap !bg-light-03 min-h-screen !mt-0">
      <div className="containers">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full max-w-lg mx-auto py-10 space-y-5"
        >
          {/* 타이틀 및 아이콘 한 줄 정렬 (가운데 정렬) */}
          <div className="flex flex-row items-center justify-center gap-2 mb-10">
            <span className="material-icons text-5xl leading-none text-deep">
              account_circle
            </span>
            <h4 className="text-2xl font-bold leading-none text-deep !m-0">
              회원 가입
            </h4>
          </div>

          {/* 기본 입력 정보 */}
          <div className="space-y-1">
            <input
              type="text"
              name="name"
              placeholder="이름"
              onChange={handleChange}
              className={`w-full p-3 border rounded-md bg-white text-black ${
                errors.name ? "border-red-500" : "border-main-02"
              }`}
              required
            />
            {errors.name && (
              <p className="text-red-500 text-xs px-1">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex gap-2 items-end">
              <input
                type="email"
                name="email"
                placeholder="이메일"
                onChange={handleChange}
                className={`flex-1 p-3 border rounded-md bg-white text-black ${
                  errors.email ? "border-red-500" : "border-main-02"
                }`}
                required
              />
              <BtnComp
                ref={emailCheckBtnRef}
                size="short"
                variant="primary"
                type="button"
                className="mt-0 h-[48px]"
                onClick={handleEmailCheck}
              >
                중복확인
              </BtnComp>
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs px-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              onChange={handleChange}
              className={`w-full p-3 border rounded-md bg-white text-black ${
                errors.password ? "border-red-500" : "border-main-02"
              }`}
              required
            />
            {errors.password && (
              <p className="text-red-500 text-xs px-1">{errors.password}</p>
            )}
          </div>

          <div className="space-y-1">
            <input
              type="password"
              name="passwordConfirm"
              placeholder="비밀번호 확인"
              onChange={handleChange}
              className={`w-full p-3 border rounded-md bg-white text-black ${
                errors.passwordConfirm ? "border-red-500" : "border-main-02"
              }`}
              required
            />
            {errors.passwordConfirm && (
              <p className="text-red-500 text-xs px-1">
                {errors.passwordConfirm}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                name="birthYear"
                placeholder="년(4자)"
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
              onChange={handleChange}
              className={`w-full p-3 border rounded-md bg-white ${
                errors.phone ? "border-red-500" : "border-main-02"
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs px-1">{errors.phone}</p>
            )}
          </div>

          {/* 성별 선택 */}
          <div className="flex items-center gap-6 py-2 text-deep font-bold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="M"
                checked={formData.gender === "M"}
                onChange={handleChange}
                className="accent-main-02"
              />{" "}
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
              />{" "}
              여
            </label>
          </div>

          {/* 신체 스펙 */}
          <div className="space-y-1">
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                name="height"
                placeholder="키(cm)"
                onChange={handleChange}
                className={`p-3 border rounded-md bg-white ${
                  errors.height ? "border-red-500" : "border-main-02"
                }`}
              />
              <input
                type="number"
                name="weight"
                placeholder="몸무게(kg)"
                onChange={handleChange}
                className={`p-3 border rounded-md bg-white ${
                  errors.weight ? "border-red-500" : "border-main-02"
                }`}
              />
              <input
                type="number"
                name="goal_weight"
                placeholder="목표(kg)"
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

          {/* 가입 목적 (BtnComp로 교체) */}
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
                      : "bg-main-02 text-white  hover:bg-main-01"
                  }`}
                  onClick={() => setFormData((p) => ({ ...p, goal: g }))}
                >
                  {g}
                </BtnComp>
              ))}
            </div>
          </div>

          {/* 목표 기간 */}
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
              placeholder="목표 기간을 입력해 주세요 (30~180일)"
              onChange={handleChange}
              className={`w-full p-3 border rounded-md bg-white ${
                errors.target_date ? "border-red-500" : "border-main-02"
              }`}
            />
            {errors.target_date && (
              <p className="text-red-500 text-xs px-1">{errors.target_date}</p>
            )}
          </div>

          {/* 알러지 여부 체크 (BtnComp로 교체) */}
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
                    formData.selectedAllergies.includes(a) ? "primary" : "line"
                  }
                  className={`mt-0 h-[36px] w-full border-none ${
                    formData.selectedAllergies.includes(a)
                      ? "bg-deep"
                      : "bg-main-02 text-white  hover:bg-main-01"
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
            onChange={handleChange}
            className="w-full p-3 border border-main-02 rounded-md h-24 bg-white"
          />

          {/* 최종 가입 버튼 */}
          <div className="pt-1 sm:pt-4">
            <BtnComp size="long" variant="primary" type="submit">
              회원가입
            </BtnComp>
          </div>

          <div className="text-center ">
            <Link
              to="/member/signin"
              className="text-gray-mid text-sm hover:underline"
            >
              이미 계정이 있으신가요? 로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
