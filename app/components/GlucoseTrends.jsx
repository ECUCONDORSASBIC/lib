// app/components/GlucoseTrends.jsx
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GlucoseTrends = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Glucosa (mg/dL)',
        data: data.map(d => d.value),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.08)',
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#10B981',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#334155', font: { size: 13, family: 'inherit' } },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#10B981',
        bodyColor: '#334155',
        borderColor: '#10B981',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { size: 12, family: 'inherit' } },
        grid: { color: '#e2e8f0' },
      },
      y: {
        ticks: { color: '#64748b', font: { size: 12, family: 'inherit' } },
        grid: { color: '#e2e8f0' },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-base font-semibold text-primary mb-2">Tendencias de Glucosa</h3>
      <div className="h-56">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default GlucoseTrends;
