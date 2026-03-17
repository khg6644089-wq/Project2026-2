import React, { useState } from "react";
import BtnComp from "../../../components/BtnComp";
import { apiClient } from "../../../api/config";

/** 비밀번호 변경 (PATCH /me/password) */
const updatePassword = async (currentPassword, newPassword) => {
  const response = await apiClient.patch("/me/password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};

function ChangePassword() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: null }));
    }
    setPasswordSuccess(null);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const err = {};
    const { currentPassword, newPassword, newPasswordConfirm } = passwordForm;
    if (!currentPassword?.trim())
      err.currentPassword = "현재 비밀번호를 입력해주세요.";
    if (!newPassword?.trim()) err.newPassword = "새 비밀번호를 입력해주세요.";
    else if (newPassword.length < 6)
      err.newPassword = "새 비밀번호는 6자 이상이어야 합니다.";
    if (newPassword !== newPasswordConfirm) {
      err.newPasswordConfirm = "새 비밀번호가 일치하지 않습니다.";
    }
    if (Object.keys(err).length > 0) {
      setPasswordErrors(err);
      return;
    }
    setPasswordErrors({});
    setPasswordSuccess(null);
    setPasswordChanging(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordSuccess("비밀번호가 변경되었습니다.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });
    } catch (errRes) {
      setPasswordErrors({
        submit:
          errRes.response?.data?.message || "비밀번호 변경에 실패했습니다.",
      });
    } finally {
      setPasswordChanging(false);
    }
  };

  return (
    <div className="pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={() => setShowPasswordSection((prev) => !prev)}
        className="w-full flex items-center gap-2 text-left py-1 -ml-1 rounded hover:bg-gray-100"
        aria-expanded={showPasswordSection}
      >
        <span
          className={`inline-block transition-transform text-deep text-xs ${
            showPasswordSection ? "rotate-90" : "rotate-0"
          }`}
          aria-hidden
        >
          &rsaquo;
        </span>
        <span className="font-bold text-deep text-sm">비밀번호 변경</span>
      </button>
      {showPasswordSection && (
        <div className="mt-3 pl-4 border-l-2 border-main-02/30">
          <div className="space-y-3">
            <div className="space-y-1">
              <input
                type="password"
                name="currentPassword"
                placeholder="현재 비밀번호"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className={`w-full p-3 border rounded-md bg-white ${
                  passwordErrors.currentPassword
                    ? "border-red-500"
                    : "border-main-02"
                }`}
                autoComplete="current-password"
              />
              {passwordErrors.currentPassword && (
                <p className="text-red-500 text-xs px-1">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <input
                type="password"
                name="newPassword"
                placeholder="새 비밀번호"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className={`w-full p-3 border rounded-md bg-white ${
                  passwordErrors.newPassword
                    ? "border-red-500"
                    : "border-main-02"
                }`}
                autoComplete="new-password"
              />
              {passwordErrors.newPassword && (
                <p className="text-red-500 text-xs px-1">
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <input
                type="password"
                name="newPasswordConfirm"
                placeholder="새 비밀번호 확인"
                value={passwordForm.newPasswordConfirm}
                onChange={handlePasswordChange}
                className={`w-full p-3 border rounded-md bg-white ${
                  passwordErrors.newPasswordConfirm
                    ? "border-red-500"
                    : "border-main-02"
                }`}
                autoComplete="new-password"
              />
              {passwordErrors.newPasswordConfirm && (
                <p className="text-red-500 text-xs px-1">
                  {passwordErrors.newPasswordConfirm}
                </p>
              )}
            </div>
            {passwordErrors.submit && (
              <p className="text-red-500 text-xs px-1">
                {passwordErrors.submit}
              </p>
            )}
            {passwordSuccess && (
              <p className="text-green-600 text-sm">{passwordSuccess}</p>
            )}
            <BtnComp
              type="button"
              variant="line"
              size="long"
              onClick={handlePasswordSubmit}
              disabled={passwordChanging}
            >
              {passwordChanging ? "변경 중..." : "비밀번호 변경"}
            </BtnComp>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChangePassword;
