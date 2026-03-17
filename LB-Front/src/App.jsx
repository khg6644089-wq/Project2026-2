import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import NavComp from "./components/NavComp";
import FooterComp from "./components/FooterComp";
import Home from "./assets/page/home/Home";
import Member from "./assets/member/Member";
import About from "./assets/page/about/About";
import Club from "./assets/page/club/Club";
import Event from "./assets/page/event/Event";
import MyPage from "./assets/page/mypage/MyPage";
import CMManagement from "./assets/page/CM/CMManagement";
import Admin from "./assets/page/admin/Admin";
import ChatbotPanel from "./components/chatbot/ChatbotPanel";
import ChatbotButton from "./components/chatbot/ChatbotButton";
import { useAuthStore } from "./stores/authStore";

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { accessToken } = useAuthStore();
  return (
    <>
      <NavComp />
      {/* 네브가 fixed 이므로, 네브 높이(4rem) 만큼 위 여백을 줘서 내용이 가려지지 않도록 함 */}
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/member/*" element={<Member />} />
          <Route path="/about" element={<About />} />
          <Route path="/club/*" element={<Club />} />
          <Route path="/event/*" element={<Event />} />
          <Route path="/mypage/*" element={<MyPage />} />

          {/* CM 라우터 */}
          <Route path="/CMmanagement/*" element={<CMManagement />} />

          {/* 어드민 라우터 */}
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </div>
      <FooterComp />

      {/* 로그인 상태일 때만 챗봇 보여주기 */}
      {accessToken && (
        <>
          <ChatbotButton onClick={() => setIsChatOpen(true)} />
          {isChatOpen && <ChatbotPanel onClose={() => setIsChatOpen(false)} />}
        </>
      )}
    </>
  );
}

export default App;
