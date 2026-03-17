import DonutChart from "./charts/DonutChart";
import BarChart from "./charts/BarChart";
import LineChart from "./charts/LineChart";
import PieChart from "./charts/PieChart";

function Chart({ type = "donut", data, options }) {
  if (!data) {
    return (
      <div className="p-4 text-center text-gray-500">
        차트 데이터가 없습니다.
      </div>
    );
  }

  switch (type) {
    case "donut":
      return <DonutChart data={data} options={options} />;
    case "pie":
      return <PieChart data={data} options={options} />;
    case "line":
      return <LineChart data={data} options={options} />;
    case "bar":
      return <BarChart data={data} options={options} />;
    default:
      return (
        <div className="p-4 text-center text-red-500">
          지원하지 않는 차트 타입입니다.
        </div>
      );
  }
}

export default Chart;
