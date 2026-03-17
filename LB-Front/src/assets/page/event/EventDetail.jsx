// EventDetailPage.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import BtnComp from "../../../components/BtnComp";

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const eventId = String(id);

  const eventContents = {
    "1": {
      imagePc: "https://yojekojpfikeuposuyuf.supabase.co/storage/v1/object/public/images/ev01_pc.png",
      imageMb: "https://yojekojpfikeuposuyuf.supabase.co/storage/v1/object/public/images/ev01_mb.png",
    },
    "2": {
      imagePc: "https://yojekojpfikeuposuyuf.supabase.co/storage/v1/object/public/images/ev02_pc.png",
      imageMb: "https://yojekojpfikeuposuyuf.supabase.co/storage/v1/object/public/images/ev02_mb.png",
    },
    "3": {
      imagePc: "https://yojekojpfikeuposuyuf.supabase.co/storage/v1/object/public/images/ev03_pc.png",
      imageMb: "https://yojekojpfikeuposuyuf.supabase.co/storage/v1/object/public/images/ev03_mb.png",
    },
    "4": {
      imagePc: "https://yojekojpfikeuposuyuf.supabase.co/storage/v1/object/public/images/ev04_pc.png",
      imageMb: "https://yojekojpfikeuposuyuf.supabase.co/storage/v1/object/public/images/ev04_mb.png",
    },
  };

  const event = eventContents[eventId] || {
    imagePc: null,
    imageMb: null,
  };

  return (
    <>
      {/* 🔥 상단 전체 너비 반응형 이미지 */}
      {(event.imagePc || event.imageMb) && (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-black">

          {/* 📱 모바일 이미지 */}
          {event.imageMb && (
            <img
              src={event.imageMb}
              alt="event mobile"
              className="w-full h-auto object-contain md:hidden"
            />
          )}

          {/* 💻 PC 이미지 */}
          {event.imagePc && (
            <img
              src={event.imagePc}
              alt="event pc"
              className="hidden md:block w-full h-auto object-contain mx-auto"
            />
          )}
        </div>
      )}

      {/* 🔥 버튼 영역만 유지 */}
      <div className="px-4 md:px-10 py-10">
        <div className="max-w-5xl mx-auto text-center md:text-left">
          <BtnComp
            size="long"
            variant="primary"
            onClick={() => navigate("/event")}
          >
            이벤트 목록
          </BtnComp>
        </div>
      </div>
    </>
  );
}

export default EventDetail;
