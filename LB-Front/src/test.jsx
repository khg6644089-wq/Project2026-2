import BtnComp from "./components/BtnComp";
import FooterComp from "./components/FooterComp";
import NavComp from "./components/NavComp";
import PageNatation from "./components/PageNatation";
import Chart from "./components/ChartComp";
import {
  getBarChartData1,
  getBarChartData2,
  getPieChartData,
} from "./api/TestChartData";
import { Doughnut } from "react-chartjs-2";

function App() {
  const barData1 = getBarChartData1();
  const barData2 = getBarChartData2();
  const pieData = getPieChartData();

  return (
    <>
      <NavComp />
      <div className="wrap">
        <div className="containers">
          <div className="bg-main-01">컬러</div>
          <div className="bg-main-02">컬러</div>
          <div className="bg-light-01">컬러</div>
          <div className="bg-light-02">컬러</div>
          <div className="bg-light-03">컬러</div>
          <div className="bg-deep text-white">컬러</div>
          <div className="bg-white text-black">컬러</div>
          <div className="bg-black text-white">컬러</div>
          <div className="bg-point text-white">컬러</div>
          <div className="bg-gray-deep text-white">컬러</div>
          <div className="bg-gray-mid text-white">컬러</div>
          <div className="bg-gray-light text-black">컬러</div>

          <h4 className="tit">
            <span className="material-icons">star_outline</span>
            타이틀 테스트
          </h4>
          <i className="fa-solid fa-tooth"></i>
          <h1>계절이 지나가는 하늘에는</h1>
          <h2>계절이 지나가는 하늘에는</h2>
          <h3>계절이 지나가는 하늘에는</h3>
          <h4>계절이 지나가는 하늘에는</h4>
          <span>계절이 지나가는 하늘에는</span>
          <p>계절이 지나가는 하늘에는</p>
          <a>계절이 지나가는 하늘에는</a>
          <span className="dummy block">계절이 지나가는 하늘에는</span>

          <div className="w-full">
            <PageNatation
              storeKey="test-list"
              totalElements={100}
              pageSize={10}
            />
          </div>

          <div className="w-full">
            <PageNatation
              storeKey="test-list2"
              totalElements={100}
              pageSize={10}
            />
          </div>

          <div className="w-[50%] flex flex-col flex-wrap">
            <BtnComp size="long" variant="primary">
              long
            </BtnComp>

            <BtnComp size="mid" variant="line">
              mid
            </BtnComp>

            <BtnComp size="short" variant="point">
              short
            </BtnComp>
          </div>

          <div className="w-full mt-8">
            <Chart type="pie" data={pieData} />
          </div>

          <div className="w-full mt-8">
            <Chart type="bar" data={barData2} />
          </div>
        </div>
      </div>
      <FooterComp></FooterComp>
    </>
  );
}

export default App;
