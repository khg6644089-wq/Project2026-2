import React, { useState } from "react";
import ChatbotPanel from "./ChatbotPanel";

function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* 버튼은 항상 화면에 표시 */}
      <button
        onClick={togglePanel}
        className="fixed bottom-6 right-6 w-14 h-14 bg-main-02 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-main-01 transition"
      >
        {isOpen ? (
          <span className="w-full h-full flex items-center justify-center !text-5xl font-bold leading-none">
            ×
          </span>
        ) : (
          <img
            src="https://yjpmigedokqexuclsapm.supabase.co/storage/v1/object/public/images/chatbot.png"
            alt="Chatbot"
            className="w-full h-full rounded-full object-cover"
          />
        )}
      </button>

      {/* 패널 */}
      {isOpen && <ChatbotPanel />}
    </>
  );
}

export default ChatbotButton;
