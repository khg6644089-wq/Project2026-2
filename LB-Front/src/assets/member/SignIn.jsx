import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { callSignIn } from "../../api/auth";
import { useAuthStore } from "../../stores/authStore";
import BtnComp from "../../components/BtnComp";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setLogin = useAuthStore((state) => state.setLogin);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        setError("아이디와 비밀번호를 입력해주세요.");
        setLoading(false);
        return;
      }

      const response = await callSignIn({ email, password });

      if (!response) {
        setError("로그인에 실패했습니다.");
        setLoading(false);
        return;
      }

      if (response.error) {
        setError(response.error || "로그인에 실패했습니다.");
        setLoading(false);
        return;
      }

      setLogin(response);
      // 어드민 유저인 경우 /admin으로 리다이렉트
      const isAdmin = response.role === 2 || response.roles?.includes("ADMIN");
      navigate(isAdmin ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-02 flex flex-col items-center justify-center p-6">
      {/* 로고 영역 */}
      <div className="mb-12 flex flex-col items-center">
        <div className="flex items-center gap-3">
          <div className="w-40">
            <img
              src="https://fvdyqzogufeurojwjqwt.supabase.co/storage/v1/object/sign/logo/logoColor2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMDY3OTY1My1jNzIxLTRlMGMtYmY2Yy1iZWUwZjBhM2EyMWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL2xvZ29Db2xvcjIucG5nIiwiaWF0IjoxNzY5NDEyMzkwLCJleHAiOjE4MDA5NDgzOTB9.3Pz3GYQV0_tskdhOBd95hscuZAA8yao5D6hkHAGGvpQ"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* 로그인 폼 */}
      <form onSubmit={handleSignIn} className="w-full max-w-100">
        {/* 에러 메시지 표시 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="아이디"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[50px] px-4 rounded-md border border-main-02 bg-white focus:outline-none focus:ring-1 focus:ring-main-02 placeholder:text-gray-400"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[50px] px-4 rounded-md border border-main-02 bg-white focus:outline-none focus:ring-1 focus:ring-main-02 placeholder:text-gray-400"
            required
            disabled={loading}
          />
        </div>

        {/* BtnComp 사용 */}
        <div className="flex flex-col">
          <BtnComp
            type="submit"
            size="long"
            variant="primary"
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </BtnComp>

          <Link to="/member/signup" className="w-full">
            <BtnComp
              type="button"
              size="long"
              variant="primary"
              className="mt-4"
            >
              회원가입
            </BtnComp>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default SignIn;
