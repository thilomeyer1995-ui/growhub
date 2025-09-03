import React from 'react';
import { Line } from 'react-chartjs-2';
import '../utils/chartConfigNoAdapter'; // Chart.js-Konfiguration ohne date-fns Adapter

const TemperatureChart = ({ data }) => {
  // Verarbeite die Daten für Chart.js
  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.time);
      return date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }),
    datasets: [
      {
        label: 'Temperatur (°C)',
        data: data.map(item => item.value),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function(context) {
            const dataIndex = context[0].dataIndex;
            const originalDate = new Date(data[dataIndex].time);
            return originalDate.toLocaleString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          },
          label: function(context) {
            return `Temperatur: ${context.parsed.y.toFixed(1)}°C`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Zeit',
          font: {
            size: 14
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Temperatur (°C)',
          font: {
            size: 14
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return value + '°C';
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-info" role="alert">
          <h5>Keine Daten verfügbar</h5>
          <p>Es sind noch keine Temperaturdaten vorhanden.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '400px', position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default TemperatureChart;
