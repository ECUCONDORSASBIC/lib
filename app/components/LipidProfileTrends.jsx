// app/components/LipidProfileTrends.jsx
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const LipidProfileTrends = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Colesterol Total',
        data: data.map(d => d.total),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      },
      {
        label: 'HDL',
        data: data.map(d => d.hdl),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      },
      {
        label: 'LDL',
        data: data.map(d => d.ldl),
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        borderColor: 'rgb(255, 206, 86)',
        borderWidth: 1
      },
      {
        label: 'Triglicéridos',
        data: data.map(d => d.triglycerides),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }
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
        titleColor: '#334155',
        bodyColor: '#334155',
        borderColor: '#e2e8f0',
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
      <h3 className="text-base font-semibold text-primary mb-2">Perfil Lipídico</h3>
      <div className="h-56">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LipidProfileTrends;
