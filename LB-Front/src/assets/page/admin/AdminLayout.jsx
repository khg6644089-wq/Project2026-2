import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // 권한 체크: role이 2이거나 roles에 "ADMIN"이 있어야 접근 가능
  const isAdmin = user?.role === 2 || user?.roles?.includes("ADMIN");
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-02">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-deep mb-4">접근 권한이 없습니다</h2>
          <p className="text-gray-600 mb-6">어드민 권한이 필요합니다.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-main-02 text-white rounded-lg hover:bg-deep transition-colors"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { path: "/admin", label: "대시보드", icon: "dashboard" },
    { path: "/admin/members", label: "멤버 관리", icon: "people" },
    { path: "/admin/club-members", label: "클럽별 멤버", icon: "group" },
    { path: "/admin/clubs", label: "클럽 관리", icon: "sports_soccer" },
  ];

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-light-02">
      <div className="containers py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 사이드바 */}
          <aside className="w-full lg:w-64 bg-white rounded-xl shadow-md p-6 h-fit">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-deep mb-2">어드민</h1>
              <p className="text-sm text-gray-600">시스템 관리</p>
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-main-02 text-white"
                      : "text-deep hover:bg-light-01"
                  }`}
                >
                  <span className="material-icons text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-deep hover:bg-light-01"
              >
                <span className="material-icons text-xl">home</span>
                <span className="font-medium">사이트 바로가기</span>
              </button>
            </nav>
          </aside>

          {/* 메인 컨텐츠 */}
          <main className="flex-1 bg-white rounded-xl shadow-md p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
