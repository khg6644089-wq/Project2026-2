import { useEffect, useState } from "react";
import { callRefresh } from "../../api/auth";
import { useAuthStore } from "../../stores/authStore";

const AuthProvider = ({ children }) => {
  const { setLogin, setLogout } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const data = await callRefresh();
        if (data) {
          setLogin(data);
        } else {
          setLogout();
        }
      } catch (error) {
        console.log(
          "AuthProvider 인증 복구 실패:",
          error.response?.data ?? error.message,
        );
        setLogout();
      } finally {
        setIsInitialized(true);
      }
    };
    initAuth();
  }, []);

  // Ctrl+F5 등 새로고침 시 토큰 복구가 끝날 때까지 로딩만 표시 (잘못된 로그아웃 UI 방지)
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-03">
        <p className="text-deep">로딩 중...</p>
      </div>
    );
  }

  return children;
};

export default AuthProvider;
