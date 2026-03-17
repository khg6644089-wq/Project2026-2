import React, { useState, useRef, useEffect } from "react";
import { askChatbot } from "../../api/Chatbot";

function ChatbotPanel({ onClose }) {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "안녕하세요! 밸런스봇이에요. 체력, 식단, 운동 중 무엇을 도와드릴까요?",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 스크롤 자동 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 옵션 버튼 클릭
  const handleOptionClick = async (option) => {
    setMessages((prev) => [...prev, { from: "user", text: option }]);
    setLoading(true);

    try {
      const res = await askChatbot(option);

      setMessages((prev) => [...prev, { from: "bot", text: res.answer }]);
    } catch (err) {
      console.error("챗봇 오류:", err);

      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "서버 오류가 발생했습니다." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 메시지 전송
  const handleSend = async () => {
    if (!userInput.trim()) return;

    const input = userInput;

    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setUserInput("");
    setLoading(true);

    try {
      const res = await askChatbot(input);

      setMessages((prev) => [...prev, { from: "bot", text: res.answer }]);
    } catch (err) {
      console.error("챗봇 오류:", err);

      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "서버 오류가 발생했습니다." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="fixed bottom-22 right-6 w-[320px] h-[450px] bg-light-02 border border-gray-300 rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* 상단 로고 */}
      <div className="flex items-center justify-start px-4 py-2">
        <img
          src="https://fvdyqzogufeurojwjqwt.supabase.co/storage/v1/object/sign/logo/logoColor2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMDY3OTY1My1jNzIxLTRlMGMtYmY2Yy1iZWUwZjBhM2EyMWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL2xvZ29Db2xvcjIucG5nIiwiaWF0IjoxNzcyNjA2MTY4LCJleHAiOjg2NTc3MjUxOTc2OH0.eaD2apt9JlDmM5oHt1JzYOkqrExqgoPkHYUgo5XApuY"
          alt="밸런스봇 로고"
          className="w-[30%]"
        />
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-light-02">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="w-full flex"
            style={{
              justifyContent: msg.from === "bot" ? "flex-start" : "flex-end",
            }}
          >
            <div className="flex flex-col">
              <span className="!text-xs text-black mb-1 flex items-center gap-1">
                {msg.from === "bot" && (
                  <img
                    src="https://yjpmigedokqexuclsapm.supabase.co/storage/v1/object/public/images/chatbot.png"
                    alt="로봇"
                    className="w-4 h-4 rounded-full"
                  />
                )}
                {msg.from === "bot" ? "밸런스봇" : "나"}
              </span>

              {/* 메시지 텍스트 */}
              <div
                className="p-2 rounded-lg text-xs bg-white text-black"
                style={{
                  maxWidth: "85vw",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  textAlign: msg.from === "bot" ? "left" : "right",
                }}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {/* 로딩 메시지 */}
        {loading && (
          <div className="flex justify-start">
            <div className="text-xs text-gray-500">
              밸런스봇이 답변을 생성중입니다...
            </div>
          </div>
        )}

        <div ref={messagesEndRef}></div>

        {/* 옵션 버튼 */}
        <div className="flex justify-around p-2 mt-2 bg-light-02">
          {["라스트밸런스", "체력관리", "식단관리", "운동추천"].map((opt) => (
            <button
              key={opt}
              onClick={() => handleOptionClick(opt)}
              className="px-2 py-1 bg-main-02 text-white rounded-full hover:bg-main-01 text-xs"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 사용자 입력창 */}
      <div className="p-2 bg-light-02">
        <div className="relative bg-main-02 rounded-full px-3 py-2 mx-1 shadow-md">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="w-full border-none bg-transparent text-white placeholder-white focus:outline-none !text-sm"
          />

          <button
            onClick={handleSend}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-lg font-bold !text-sm"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPanel;
