import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { callLogout } from "../api/auth";

function NavComp() {
  const user = useAuthStore((state) => state.user);
  const setLogout = useAuthStore((state) => state.setLogout);
  const isLoggedIn = !!user;
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const allNavLinks = [
    {
      // 로그인 여부와 관계없이 항상 마이페이지로 이동
      name: `${isLoggedIn ? user?.name + "님의" : ""} 밸런스 체크`,
      to: "/mypage",
    },
    { name: "커뮤니티 관리", to: "/CMmanagement", requireRole: "CLUBMANAGER" },
    { name: "어드민", to: "/admin", requireRole: "ADMIN" },
    { name: "라스트밸런스", to: "/about" },
    { name: "커뮤니티", to: "/club" },
    { name: "이벤트", to: "/event" },
  ];

  // 어드민 유저인지 확인
  const isAdmin = user?.role === 2 || user?.roles?.includes("ADMIN");

  // 권한에 따라 링크 필터링
  const navLinks = allNavLinks.filter((link) => {
    // 어드민 유저인 경우: 어드민 메뉴만 표시
    if (isAdmin) {
      return link.requireRole === "ADMIN";
    }

    // 일반 유저인 경우: 기존 로직대로 필터링
    // 요구하는 권한이 없는 링크는 통과
    if (!link.requireRole) return true;

    // 어드민 권한 체크: role이 2이거나 roles에 "ADMIN"이 있는 경우
    if (link.requireRole === "ADMIN") {
      return user?.role === 2 || user?.roles?.includes("ADMIN");
    }

    // 요구하는 권한이 있는 경우, 사용자의 roles에 포함되어 있는지 확인
    return user?.roles?.includes(link.requireRole);
  });

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // 메뉴 열렸을 때 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // 화면 크기 변경 시 메뉴 닫기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 로그아웃 핸들러
  const handleLogout = () => {
    callLogout();
    setLogout();
    setIsOpen(false);
    navigate("/member");
  };

  // 밸런스 체크 링크 클릭 핸들러
  const handleBalanceCheckClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      alert("로그인 시 이용 가능합니다");
    }
  };

  return (
    <nav className="bg-main-02 text-white fixed w-full top-0 left-0 z-50 shadow-lg">
      <div className="w-full md:w-[90%] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 햄버거 메뉴 */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
              aria-label="메뉴 열기"
            >
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isOpen ? "rotate-45 translate-y-2" : ""
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              ></span>
            </button>
          </div>

          {/* 로고 */}
          <div className="shrink-0">
            <Link
              to="/"
              className="block hover:opacity-80 transition-opacity duration-300"
            >
              <img
                src="https://fvdyqzogufeurojwjqwt.supabase.co/storage/v1/object/sign/logo/logoWhite.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMDY3OTY1My1jNzIxLTRlMGMtYmY2Yy1iZWUwZjBhM2EyMWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL2xvZ29XaGl0ZS5wbmciLCJpYXQiOjE3Njk0MTIyNTUsImV4cCI6MTgwMDk0ODI1NX0.VEGFXR9_CaI9NVfuEm0RyGAfxinCIscReN7J6P0111Y"
                alt="logo"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* PC 메뉴 */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              {/* 어드민 유저인 경우 유저 이름 표시 */}
              {isAdmin && isLoggedIn && (
                <span className="text-white font-medium">
                  {user?.name} 관리자님
                </span>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  onClick={
                    link.to === "/mypage" ? handleBalanceCheckClick : undefined
                  }
                  className="relative text-white hover:text-light-01 transition-colors duration-300 py-2 group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300 pointer-events-none"></span>
                </Link>
              ))}
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="relative text-white hover:text-light-01 transition-colors duration-300 py-2 group cursor-pointer"
                >
                  로그아웃
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300 pointer-events-none"></span>
                </button>
              ) : (
                <Link
                  to="/member"
                  className="relative text-white hover:text-light-01 transition-colors duration-300 py-2 group"
                >
                  로그인
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300 pointer-events-none"></span>
                </Link>
              )}
            </div>
          </div>

          {/* 모바일 우측 메뉴 */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to={isLoggedIn ? "/mypage" : "/mypage"}
              onClick={handleBalanceCheckClick}
              //나중에 멤버
              className="w-10 h-10 flex items-center justify-center text-white hover:text-main-01 transition-colors duration-300"
            >
              <span className="material-icons">person</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 배경 딤 */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 top-16 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* 모바일 메뉴 */}
      <div
        className={`md:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] w-[80%] bg-light-01 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto">
          {/* 어드민 유저인 경우 유저 이름 표시 */}
          {isAdmin && isLoggedIn && (
            <div className="py-3 px-4 text-deep font-medium border-b border-main-02">
              {user?.name} 관리자님
            </div>
          )}
          {/* 모바일 메뉴 모든 항목 */}
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              to={link.to}
              className="block py-3 px-4 text-deep hover:bg-main-02/20 hover:text-deep transition-all duration-300 border-b border-main-02"
              onClick={(e) => {
                if (link.to === "/mypage" && !isLoggedIn) {
                  e.preventDefault();
                  alert("로그인 시 이용 가능합니다");
                  setIsOpen(false);
                } else {
                  setIsOpen(false);
                }
              }}
            >
              {index === 0 && isLoggedIn ? (
                <>{user?.name + "님의 밸런스 체크"}</>
              ) : (
                link.name
              )}
            </Link>
          ))}
          {/* 로그인/로그아웃 버튼 */}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full text-left py-3 px-4 text-deep hover:bg-main-02/20 hover:text-deep transition-all duration-300 border-b border-main-02 cursor-pointer"
            >
              로그아웃
            </button>
          ) : (
            <Link
              to="/member"
              className="block py-3 px-4 text-deep hover:bg-main-02/20 hover:text-deep transition-all duration-300 border-b border-main-02"
              onClick={() => setIsOpen(false)}
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavComp;
