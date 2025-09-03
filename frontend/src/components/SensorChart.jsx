import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import '../utils/chartConfigNoAdapter'; // Chart.js-Konfiguration ohne date-fns Adapter
import { apiEndpoints } from '../utils/api';

const SensorChart = ({ sensorName, title, color = '#2ecc71' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Berechne Zeitraum für die letzten 7 Tage
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const result = await apiEndpoints.sensorData(sensorName, {
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          limit: 1000
        });
        
        if (result.success) {
          setData(result.data.measurements);
        } else {
          throw new Error(result.message || 'Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching sensor data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
  }, [sensorName]);

  // Chart-Konfiguration mit Kategorie-Achsen statt Zeitachsen
  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.created_at);
      return date.toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }),
    datasets: [
      {
        label: `${sensorName.charAt(0).toUpperCase() + sensorName.slice(1)}`,
        data: data.map(item => item.value),
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#2c3e50' // Dark color for light theme
        }
      },
      title: {
        display: true,
        text: title,
        color: '#2c3e50', // Dark color for light theme
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#ffffff',
        titleColor: '#2c3e50',
        bodyColor: '#2c3e50',
        borderColor: '#2ecc71',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            const dataIndex = context[0].dataIndex;
            const originalDate = new Date(data[dataIndex].created_at);
            return originalDate.toLocaleString('de-DE');
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category', // Verwende Kategorie-Achse statt Zeit-Achse
        title: {
          display: true,
          text: 'Datum & Zeit',
          color: '#2c3e50' // Dark color for light theme
        },
        ticks: {
          color: '#2c3e50', // Dark color for light theme
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          color: '#bdc3c7' // Lighter grid for light theme
        }
      },
      y: {
        title: {
          display: true,
          text: sensorName === 'temperature' ? 'Temperatur (°C)' : 
                sensorName === 'humidity' ? 'Luftfeuchtigkeit (%)' :
                sensorName.includes('moisture') ? 'Bodenfeuchtigkeit (%)' :
                sensorName === 'distance_sensor' ? 'Distanz (cm)' : 'Wert',
          color: '#2c3e50' // Dark color for light theme
        },
        ticks: {
          color: '#2c3e50' // Dark color for light theme
        },
        grid: {
          color: '#bdc3c7' // Lighter grid for light theme
        },
        beginAtZero: sensorName === 'humidity' || sensorName.includes('moisture'),
        suggestedMin: sensorName === 'temperature' ? undefined : 0,
        suggestedMax: sensorName === 'humidity' || sensorName.includes('moisture') ? 100 : undefined
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  if (loading) {
    return (
      <div className="card shadow-sm bg-light text-dark border-secondary">
        <div className="card-body">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-sm bg-light text-dark border-secondary">
        <div className="card-body">
          <div className="alert alert-danger" role="alert">
            <strong>Fehler beim Laden der Daten:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card shadow-sm bg-light text-dark border-secondary">
        <div className="card-body">
          <div className="alert alert-info" role="alert">
            <strong>Keine Daten verfügbar:</strong> Für den Sensor "{sensorName}" wurden in den letzten 7 Tagen keine Messwerte gefunden.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm bg-light text-dark border-secondary">
      <div className="card-body">
        <div style={{ height: '300px' }}>
          <Line data={chartData} options={options} />
        </div>
        <div className="mt-3">
          <small className="text-dark">
            Daten der letzten 7 Tage • {data.length} Messwerte • 
            Letzte Aktualisierung: {new Date().toLocaleString('de-DE')}
          </small>
        </div>
      </div>
    </div>
  );
};

export default SensorChart;
