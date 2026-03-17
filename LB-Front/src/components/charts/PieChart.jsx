import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({ data, options: externalOptions }) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  // 외부 옵션이 있으면 기본 옵션과 병합 (plugins는 깊은 병합)
  const options = externalOptions
    ? {
        ...defaultOptions,
        ...externalOptions,
        plugins: {
          ...defaultOptions.plugins,
          ...externalOptions.plugins,
        },
      }
    : defaultOptions;

  return (
    <div className="w-full h-[400px]">
      <Pie data={data} options={options} />
    </div>
  );
}

export default PieChart;
