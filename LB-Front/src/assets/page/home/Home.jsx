import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BtnComp from "../../../components/BtnComp";
import MealAnal from "./MealAnal";
import { useClubStore } from "../../../api/ClubData";

function Home() {
  const navigate = useNavigate();
  const { clubs, fetchClubsBySort, loading } = useClubStore();

  useEffect(() => {
    const swiper = new window.Swiper(".home-swiper", {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });

    return () => {
      if (swiper) swiper.destroy();
    };
  }, []);

  // 최신순 클럽 데이터 가져오기
  useEffect(() => {
    const loadClubs = async () => {
      try {
        await fetchClubsBySort("latest");
      } catch (err) {
        console.error("클럽 데이터 로드 실패:", err);
      }
    };
    loadClubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 최대 4개만 표시
  const displayedClubs = clubs.slice(0, 4);

  return (
    <>
      {/* 메인 슬라이드 */}
      <div className="relative w-full myBg">
        <div className="swiper home-swiper">
          <div className="swiper-wrapper">
            <div className="swiper-slide">
              <div 
                className="w-full h-[60vw] md:h-[45vw] lg:h-[50vw] overflow-hidden cursor-pointer"
                onClick={() => navigate("/event/detail/1")}
              >
                <img
                  src="https://ynczwbybtbjftkatmcxg.supabase.co/storage/v1/object/sign/LB/ev01_bn_1920.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjY5YTJlMy0zNGQxLTRkNTMtYWYzMC0wOWM5OTZhMzE0ODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9ldjAxX2JuXzE5MjAucG5nIiwiaWF0IjoxNzY5NzUzOTIxLCJleHAiOjE4MDEyODk5MjF9.XioFTH9uhrs4OO42hJWSS9XG0fe-Pg-DBWwKFLGTG9Q"
                  alt="img"
                  className="w-full h-full object-cover object-center lg:object-top"
                />
              </div>
            </div>

            <div className="swiper-slide">
              <div 
                className="w-full h-[60vw] md:h-[45vw] lg:h-[50vw] overflow-hidden cursor-pointer"
                onClick={() => navigate("/event/detail/2")}
              >
                <img
                  src="https://ynczwbybtbjftkatmcxg.supabase.co/storage/v1/object/sign/LB/ev02_bn_1920.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjY5YTJlMy0zNGQxLTRkNTMtYWYzMC0wOWM5OTZhMzE0ODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9ldjAyX2JuXzE5MjAucG5nIiwiaWF0IjoxNzY5NzUzOTc3LCJleHAiOjE4MDEyODk5Nzd9._pVFpC_HEea3OAwbEjJowlzyElLsEdZ5tDrdANb84a8"
                  alt="img"
                  className="w-full h-full object-cover object-center lg:object-top"
                />
              </div>
            </div>

            <div className="swiper-slide">
              <div 
                className="w-full h-[60vw] md:h-[45vw] lg:h-[50vw] overflow-hidden cursor-pointer"
                onClick={() => navigate("/event/detail/3")}
              >
                <img
                  src="https://ynczwbybtbjftkatmcxg.supabase.co/storage/v1/object/sign/LB/ev03_bn_1920.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjY5YTJlMy0zNGQxLTRkNTMtYWYzMC0wOWM5OTZhMzE0ODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9ldjAzX2JuXzE5MjAucG5nIiwiaWF0IjoxNzY5NzUzOTg0LCJleHAiOjE4MDEyODk5ODR9.Bvji5OyxnNdmHVYxhRPNJJMTWptuHyRB4G_1ulZCupU"
                  alt="img"
                  className="w-full h-full object-cover object-center lg:object-top"
                />
              </div>
            </div>

            <div className="swiper-slide">
              <div 
                className="w-full h-[60vw] md:h-[45vw] lg:h-[50vw] overflow-hidden cursor-pointer"
                onClick={() => navigate("/event/detail/4")}
              >
                <img
                  src="https://ynczwbybtbjftkatmcxg.supabase.co/storage/v1/object/sign/LB/ev04_bn_1920.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjY5YTJlMy0zNGQxLTRkNTMtYWYzMC0wOWM5OTZhMzE0ODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9ldjA0X2JuXzE5MjAucG5nIiwiaWF0IjoxNzY5NzUzOTkyLCJleHAiOjE4MDEyODk5OTJ9.SFDM1QxSlJzUidHPE99SuCS8dtVfD4sgGHQ0AXC1GZM"
                  alt="img"
                  className="w-full h-full object-cover object-center lg:object-top"
                />
              </div>
            </div>
          </div>
          {/* 화살표 네비게이션 */}
          <div className="swiper-button-prev !text-white !w-12 !h-12 after:!text-2xl"></div>
          <div className="swiper-button-next !text-white !w-12 !h-12 after:!text-2xl"></div>
        </div>
      </div>

      <div className="wrap !mt-0">
        <div className="containers justify-center items-center w-full">
          {/* sect1 */}
          <section className="sect1 w-full lg:w-[90%] lg:min-w-[1000px] xl:w-[80%]  2xl:w-[70%] flex flex-col lg:flex-row justify-between text-black my-[10%]">
            <div className="w-full lg:w-[50%] aspect-[4/3] lg:aspect-[16/9] overflow-hidden flex items-center justify-cente">
              <img
                src="https://ynczwbybtbjftkatmcxg.supabase.co/storage/v1/object/sign/LB/sal.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjY5YTJlMy0zNGQxLTRkNTMtYWYzMC0wOWM5OTZhMzE0ODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9zYWwucG5nIiwiaWF0IjoxNzY5NzU2MjI0LCJleHAiOjE4MDEyOTIyMjR9.3TsRR1yE6Bncxz9AmLaxFi-6DQdqfu-0TE3lhtAvcdo"
                alt="img"
                className="h-full object-cover object-center"
              />
            </div>

            <div className="w-full lg:w-[50%] mt-8 lg:mt-0 lg:ml-12 justify-between flex flex-col">
              <div>
                <h2 className="!text-base md:!text-lg lg:!text-xl xl:!text-2xl">
                  마지막까지 균형 잡힌 식단과
                  <br /> 건강 지표를 관리하는 스마트 헬스케어 플랫폼
                </h2>

                <p className="dummy mt-[5%]">
                  라스트 밸런스는 마지막까지 균형 잡힌 식단과 건강 지표를 관리할
                  수 있도록 설계된 스마트 헬스케어 플랫폼입니다. 사용자의 식단
                  기록과 활동 정보를 기반으로 현재 상태를 정확하게 파악하고,
                  영양소 균형을 유지하는 데 필요한 데이터를 실시간으로
                  제공합니다.
                  <br />
                  <br />
                  일상 속에서 놓치기 쉬운 섭취 습관, 운동량, 기초 체성분 변화
                  등을 직관적으로 확인할 수 있으며, 이를 통해 건강 관리에 대한
                  동기부여와 지속성을 높일 수 있습니다. 또한 개인별 목표 설정과
                  맞춤 피드백 기능을 통해 사용자가 원하는 방향으로 건강을 조절할
                  수 있도록 도와드립니다.
                  <br />
                  <br />
                  해당 플랫폼은 단순히 칼로리를 계산하거나 식단을 추천하는
                  수준을 넘어, 장기적인 건강 지표를 기반으로 스스로 균형을
                  유지하는 능력을 기르는 데 목적을 두고 있습니다. 끝까지 균형
                  잡힌 식생활과 체계적인 헬스케어를 통해 더욱 건강한 삶을 만들
                  수 있도록 지원합니다.
                </p>
              </div>

              <BtnComp variant="primary" onClick={() => navigate("/about")}>
                라스트 밸런스 소개 바로가기
              </BtnComp>
            </div>
          </section>
        </div>

        {/* sect2 */}
        <section
          className="sect2 flex flex-col justify-center items-center py-[10%] mt-[5%]"
          style={{
            backgroundImage:
              'url("https://ynczwbybtbjftkatmcxg.supabase.co/storage/v1/object/sign/LB/sect2_bg.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjY5YTJlMy0zNGQxLTRkNTMtYWYzMC0wOWM5OTZhMzE0ODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMQi9zZWN0Ml9iZy5wbmciLCJpYXQiOjE3Njk3NjI0MzksImV4cCI6MTgwMTI5ODQzOX0.hsUqxsdlkEmMmSMBMgLRxEptO1x3DKeZZewa_OPTpZo")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <MealAnal showDetails={false} />
        </section>

        {/* sect3 */}
        <div className="containers my-[10%] ">
          <section className="sect3 w-full flex flex-col justify-center items-center ">
            <div className="cont_tit w-[90%] sm:w-[70%] md:w-[60%] lg:w-[50%] xl:w-[40%] flex flex-col justify-center items-center my-[3%] sm:my-[4%] md:my-[5%]">
              <h2 className="!text-base md:!text-lg lg:!text-xl xl:!text-3xl text-black">
                금주에 신설된 커뮤니티
              </h2>
              <span className="bg-main-02 h-[2px] w-[80%] mt-5"></span>
              <p className="dummy mt-5 text-center">
                혼자서는 쉽게 흐트러질 수 있는 운동 계획과 식단 관리를 서로
                공유하고 응원하며, 꾸준히 실천할 수 있도록 돕는 것을 목표로
                합니다. 매일의 운동 기록, 식단 사진, 체중 변화, 운동 루틴, 건강
                관련 정보까지 자유롭게 나누며 각자의 경험이 누군가에게는 큰
                동기부여가 됩니다.
              </p>
            </div>
          </section>

          {/* 카드 섹션 */}
          <div
            className="w-[95%] sm:w-[90%] md:w-[100%] lg:w-full xl:w-[80%] lg:min-w-[940px] xl:min-w-0
  mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-10 justify-items-stretch mb-[10%]"
          >
            {loading ? (
              <div className="col-span-2 flex justify-center items-center h-[400px] text-gray-500">
                로딩 중...
              </div>
            ) : (
              displayedClubs.map((club) => (
                <div
                  key={club.id}
                  onClick={() => navigate(`/club/detail/${club.id}`)}
                  className="bg-deep rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1 cursor-pointer"
                >
                  {/* 이미지 */}
                  <div className="w-full h-[200px] sm:h-[300px] overflow-hidden ">
                    <img
                      src={club.image}
                      alt={club.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 내용 */}
                  <div className="p-4 flex flex-col items-center text-center gap-2 text-light-03">
                    <h4 className="text-lg font-semibold text-light-03">
                      {club.name}
                    </h4>
                    <p className="text-sm text-light-03/90 line-clamp-2 w-[70%]">
                      {club.desc}
                    </p>

                    {/* 태그 */}
                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mt-3">
                      {club.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 !text-[14px] !sm:text-xs !md:text-sm !lg:text-sm rounded-full border border-light-03 bg-light-03 text-deep"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
