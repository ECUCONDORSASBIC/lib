import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BloodPressureTrends = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Sistólica',
        data: data.map(d => d.systolic),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.08)',
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#2563eb',
      },
      {
        label: 'Diastólica',
        data: data.map(d => d.diastolic),
        borderColor: '#f59e42',
        backgroundColor: 'rgba(245,158,66,0.08)',
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#f59e42',
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
        titleColor: '#2563eb',
        bodyColor: '#334155',
        borderColor: '#2563eb',
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
      <h3 className="text-base font-semibold text-primary mb-2">Tendencias de Presión Arterial</h3>
      <div className="h-56">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BloodPressureTrends;
