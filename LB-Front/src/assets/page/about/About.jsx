import React from "react";

function About() {
  return (
    <div className="px-4 md:px-10 py-6 md:py-10 space-y-6 md:space-y-10">

      {/* Title */}
      <div className="text-center mx-auto">
        <h3 className="!font-black !text-[#05A445] !tracking-tight !text-[clamp(2.5rem,8vw,7.5rem)]">
          LAST BALANCE
        </h3>
      </div>

      {/* Top Green Bar */}
      <div className="mx-auto w-full sm:w-20/21 md:w-20/21 lg:w-20/21 h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 bg-[#05A445] shadow-md border border-gray-200 mb-14 sm:mb-16 md:mb-20 lg:mb-24"></div>

      {/* Sections */}
      <div className="sm:w-20/21 md:w-20/21 lg:w-20/21 mx-auto flex flex-col gap-20 md:gap-32 lg:gap-32">

        {/* 섹션 1 */}
        <div className="flex flex-col lg:flex-row items-stretch gap-7 lg:gap-0 lg:space-x-8 ">
          <img
            src="https://yojekojpfikeuposuyuf.supabase.co/storage/v1/object/public/images/Image_fx_27.png"
            alt="식단 관리"
            className="w-full lg:w-1/3 h-56 sm:h-64 lg:h-auto aspect-[1/1] object-cover rounded-lg mb-6 lg:mb-0"
          />
          <div className="w-full lg:w-3/4 border border-green-500 p-6 pt-10 lg:pt-6 flex flex-col justify-center relative">
            <div className="absolute -top-6 -left-0.5 w-1/2 bg-green-100 text-green-800 font-bold text-lg md:text-2xl py-2 pl-6 rounded-r-lg text-left whitespace-nowrap">
              식단 관리 서비스
            </div>
            <h3 className="!text-green-600 !font-semibold mb-3 mt-6 !text-[clamp(1.05rem,1.8vw,1.9rem)]">
              사용자의 건강 목표와 생활 패턴에 맞춘
              <br />체계적인 식단 관리 서비스를 제공합니다.
            </h3>
            <p className="mb-3 !text-[clamp(0.875rem,1.5vw,1.25rem)]">
              하루 식단 기록을 통해 섭취한 음식과 영양 정보를 쉽게 확인할 수 있으며, 균형 잡힌 식생활을 유지할 수 있도록 도와줍니다.
              복잡한 칼로리 계산 없이도 자신의 식습관을 한눈에 파악하고, 지속 가능한 건강한 식단 관리를 실천할 수 있도록 설계되었습니다.
            </p>
            <p className="mb-3 !text-[clamp(0.875rem,1.5vw,1.25rem)]">
              또한, 사진 촬영만으로 음식 정보를 자동으로 인식하고 칼로리와 영양소를 계산해 주어 번거로운 입력 과정을 최소화했습니다.
              이를 통해 사용자는 시간과 노력을 크게 절약하면서도 정확한 식단 데이터를 확보할 수 있습니다.
            </p>
            <p className="mb-3 !text-[clamp(0.875rem,1.5vw,1.25rem)]">
              더 나아가, 개인별 목표 칼로리와 영양소 기준을 설정하고, 하루·주간 단위로 섭취 패턴을 시각화해 보여주어 자기 관리가 보다 체계적이고 효과적으로 이루어지도록 지원합니다.
              이렇게 사용자는 자신의 식습관을 지속적으로 모니터링하며 균형 잡힌 건강 생활을 꾸준히 실천할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 섹션 2 */}
        <div className="flex flex-col lg:flex-row-reverse items-stretch gap-7 lg:gap-0 lg:space-x-reverse lg:space-x-8">
          <img
            src="https://yojekojpfikeuposuyuf.supabase.co/storage/v1/object/public/images/Image_fx_43.png"
            alt="헬스케어"
            className="w-full lg:w-1/3 h-56 sm:h-64 lg:h-auto aspect-[1/1] object-cover rounded-lg mb-6 lg:mb-0"
          />
          <div className="w-full lg:w-3/4 border border-green-500 p-6 flex flex-col justify-center relative">
            <div className="absolute -top-5 -right-0.5 w-1/2 bg-green-100 text-green-800 font-bold text-lg md:text-2xl py-2 pr-4 rounded-l-lg text-right">
              헬스케어 & 건강 관리
            </div>
            <h3 className="!text-green-600 !font-semibold mb-3 mt-6 !text-[clamp(1.05rem,1.8vw,1.9rem)]">
              운동 기록과 신체 변화를 기반으로
              <br />맞춤형 헬스케어 서비스를 제공합니다.
            </h3>
            <p className="mb-3 text-left !text-[clamp(0.875rem,1.5vw,1.25rem)]">
              운동 종류, 시간, 강도 등 세부 데이터를 체계적으로 기록할 수 있어, 사용자는 자신의 운동 패턴과 성취를 보다 명확하게 파악할 수 있습니다.
              이를 통해 단순한 기록을 넘어, 효과적인 운동 계획 수립과 목표 달성에 필요한 인사이트를 얻을 수 있습니다.
            </p>
            <p className="mb-3 text-left !text-[clamp(0.875rem,1.5vw,1.25rem)]">
              또한, 주간·월간 단위로 운동 성과를 시각화하여 변화 과정을 한눈에 확인할 수 있으며,
              개인별 목표 달성률과 진행 상황을 실시간으로 제공해 동기 부여를 강화합니다.
            </p>
            <p className="mb-3 text-left !text-[clamp(0.875rem,1.5vw,1.25rem)]">
              이처럼 사용자는 일상 속 운동을 꾸준히 관리하며, 지속 가능한 건강 습관을 자연스럽게 형성할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 섹션 3 */}
        <div className="flex flex-col lg:flex-row items-stretch gap-7 lg:gap-0 lg:space-x-8">
          <img
            src="https://yojekojpfikeuposuyuf.supabase.co/storage/v1/object/public/images/Image_fx_42.png"
            alt="커뮤니티"
            className="w-full lg:w-1/3 h-56 sm:h-64 lg:h-auto aspect-[1/1] object-cover rounded-lg mb-6 lg:mb-0"
          />
          <div className="w-full lg:w-2/3 border border-green-500 p-6 flex flex-col justify-center relative">
            <div className="absolute -top-6 -left-0.5 w-1/2 bg-green-100 text-green-800 font-bold text-lg md:text-2xl py-2 pl-6 rounded-r-lg text-left whitespace-nowrap">
              동호회 & 커뮤니티
            </div>
            <h3 className="!text-green-600 !font-semibold mb-3 mt-6 !text-[clamp(1.05rem,1.8vw,1.9rem)]">
              같은 관심사를 가진 사용자들이 모여
              <br />운동, 식단, 건강 목표를 함께 공유하는 커뮤니티 공간을 제공합니다.
            </h3>
            <p className="mb-3 !text-[clamp(0.875rem,1.5vw,1.25rem)]">
              같은 관심사를 가진 사용자들이 모여 운동, 식단, 건강 목표를 함께 공유할 수 있는 커뮤니티 공간을 제공합니다.
              사용자는 자신의 경험과 성취를 다른 사람과 나누고, 다양한 팁과 정보를 주고받으며 건강 관리에 대한 이해를 넓힐 수 있습니다.
            </p>
            <p className="mb-3 !text-[clamp(0.875rem,1.5vw,1.25rem)]">
              동호회 활동과 그룹 챌린지를 통해 서로의 목표 달성을 응원하고, 혼자서는 꾸준히 하기 어려운 운동이나 식단 관리도 함께 실천할 수 있어 자연스럽게 동기부여가 강화됩니다.
              또한, 댓글과 피드백, 인증 게시물 등 다양한 소통 방식을 통해 공감과 격려가 활발히 이루어지며, 이는 사용자들이 지속적으로 참여하게 만드는 원동력이 됩니다.
            </p>
            <p className="mb-3 !text-[clamp(0.875rem,1.5vw,1.25rem)]">
              이처럼 커뮤니티는 단순한 정보 공유를 넘어, 즐겁고 긍정적인 건강 관리 문화를 형성하고, 사용자들이 서로의 성장 과정을 지켜보며 함께 발전할 수 있는 환경을 제공합니다.
              지속적인 참여와 교류를 통해 개인의 건강 목표 달성뿐만 아니라, 건강한 라이프스타일을 함께 만들어가는 경험을 선사합니다.
            </p>
          </div>
        </div>

        {/* 섹션 4 */}
        <div className="flex flex-col lg:flex-row-reverse items-stretch gap-7 lg:gap-0 lg:space-x-reverse lg:space-x-8 mb-12">
          <img
            src="https://yojekojpfikeuposuyuf.supabase.co/storage/v1/object/public/images/Image_fx_23.png"
            alt="라이프스타일"
            className="w-full lg:w-1/3 h-56 sm:h-64 lg:h-auto aspect-[1/1] object-cover rounded-lg mb-6 lg:mb-0"
          />
          <div className="w-full lg:w-3/4 border border-green-500 p-6 flex flex-col justify-center relative">
            <div className="absolute -top-6 -right-0.5 w-fit md:w-3/6 lg:w-3/5 max-w-[600px] flex justify-end bg-green-100 text-green-800 font-bold text-lg md:text-2xl px-6 md:px-8 py-2 rounded whitespace-nowrap">
              통합 라이프 스타일 관리 플랫폼
            </div>
            <h3 className="!text-green-600 !font-semibold mb-3 mt-6 !text-[clamp(1.05rem,1.8vw,1.9rem)]">
              식단 관리, 헬스케어, 동호회 기능을 하나로 <br /> 연결한
              통합 라이프스타일 관리 플랫폼입니다.
            </h3>
            <p className="mb-3 text-left !text-[clamp(0.875rem,1.5vw,1.25rem)]">
              사용자는 자신의 생활 패턴과 건강 상태를 종합적으로 관리할 수 있으며, 목표 설정부터 실천, 기록, 분석까지 모든 과정을 한 곳에서 편리하게 경험할 수 있습니다.
              이를 통해 단순한 건강 관리가 아니라, 개인 맞춤형 생활 습관 개선과 지속 가능한 건강 목표 달성을 지원합니다.
            </p>
            <p className="mb-3 text-left !text-[clamp(0.875rem,1.5vw,1.25rem)]">
              플랫폼은 식단 기록과 칼로리·영양 분석, 운동 데이터 추적, 건강 상태 모니터링을 통합하여 사용자가 자신의 변화를 직관적으로 확인할 수 있도록 설계되었습니다.
              또한, 관심사 기반의 커뮤니티와 동호회 활동을 통해 서로의 경험과 노하우를 공유하며, 함께 목표를 달성할 수 있는 동기 부여 환경을 제공합니다.
            </p>
            <p className="mb-3 text-left !text-[clamp(0.875rem,1.5vw,1.25rem)]">
              이러한 통합 관리 기능을 통해 사용자는 일상 속 작은 습관부터 장기적인 건강 계획까지 체계적으로 관리하며, 지속적으로 성장하는 라이프스타일을 실현할 수 있습니다.
              건강한 삶의 시작부터 유지, 발전까지 모든 단계를 지원하는 스마트 헬스케어 서비스로, 사용자에게 맞춤형 솔루션과 즐거운 참여 경험을 동시에 제공합니다.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Green Bar */}
      <div className="mx-auto w-full sm:w-20/21 md:w-20/21 lg:w-20/21 h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 bg-[#05A445] shadow-md border border-gray-200 mb-12 sm:mb-14 md:mb-16 lg:mb-20"></div>

    </div>
  );
}

export default About;
