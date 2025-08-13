import React from 'react';
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  CategoryScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Chart } from 'react-chartjs-2';

// Register all Chart.js components
ChartJS.register(
  BarController,
  LineController,
  BarElement,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  CategoryScale
);

const BotChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-light text-center">⚠ No data available for this bot.</p>;
  }

  const isDense = data.length > 500;
  const isMedium = data.length > 100 && data.length <= 500;

  // Key mapping
  const datetimeKey = Object.keys(data[0]).find(k => k.toLowerCase().includes('date')) || 'Datetime';
  const gainKey = 'gain';
  const totalKey = 'total_gain';

  const cleanedData = data.filter(d => d[datetimeKey] && !isNaN(new Date(d[datetimeKey])));

  const labels = cleanedData.map(d => d[datetimeKey]);
  const gainData = cleanedData.map(d => parseFloat(d[gainKey]));
  const totalGainData = cleanedData.map(d => parseFloat(d[totalKey]));

  const chartData = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Gain',
        data: gainData,
        backgroundColor: '#4dc9f6',
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Total Gain',
        data: totalGainData,
        borderColor: '#f67019',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        yAxisID: 'y',
        pointRadius: 0,
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const i = context.dataIndex;
            const gain = gainData[i]?.toFixed(2);
            const total = totalGainData[i]?.toFixed(2);
            if (context.dataset.type === 'bar') {
              return `Gain: ${gain}`;
            } else {
              return `Total: ${total}`;
            }
          },
          afterBody: function () {
            return [

            ];
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff'
      },
      legend: {
        labels: { color: '#ffffff' }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: isDense ? 'year' : isMedium ? 'month' : 'day', 
          tooltipFormat: 'dd/MM/yyyy', 
          displayFormats: {
            day: 'dd/MM',
            month: 'MMM yyyy',
            year: 'yyyy'
          }
        },
        ticks: {
          color: '#ffffff'
        }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'PNL',
          color: '#ffffff'
        },
        ticks: {
          color: '#ffffff'
        }
      }
    }
  };

  return (
    <>
      <div className="bg-dark rounded-3 p-3 shadow">
        <Chart type='bar' data={chartData} options={options} />
      </div>
    </>
  );
};

export default BotChart;
