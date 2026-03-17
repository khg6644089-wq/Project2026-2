import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function BarChart({ data, options: externalOptions }) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Bar Chart',
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
      <Bar data={data} options={options} />
    </div>
  );
}

export default BarChart;
