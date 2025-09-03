import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import '../utils/chartConfigNoAdapter'; // Chart.js-Konfiguration ohne date-fns Adapter

const StatsChart = ({ sensorName, startDate, endDate, color = '#2ecc71' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatsData = async () => {
      if (!sensorName || !startDate || !endDate) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // API-Aufruf zur Stats-Route
        const response = await fetch(
          `/api/data/stats/sensor?sensor=${sensorName}&start=${startDate}&end=${endDate}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch stats data');
        }
      } catch (err) {
        console.error('Error fetching stats data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatsData();
  }, [sensorName, startDate, endDate]);

  // Sensor-spezifische Konfiguration
  const getSensorConfig = (sensorName) => {
    const configs = {
      temperature: {
        label: 'Temperatur',
        unit: '°C',
        beginAtZero: false,
        suggestedMin: undefined,
        suggestedMax: undefined
      },
      humidity: {
        label: 'Luftfeuchtigkeit',
        unit: '%',
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: 100
      },
      plant1_moisture: {
        label: 'Pflanze 1 - Bodenfeuchtigkeit',
        unit: '%',
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: 100
      },
      plant2_moisture: {
        label: 'Pflanze 2 - Bodenfeuchtigkeit',
        unit: '%',
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: 100
      },
      plant3_moisture: {
        label: 'Pflanze 3 - Bodenfeuchtigkeit',
        unit: '%',
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: 100
      },
      distance_sensor: {
        label: 'Wasserstand',
        unit: 'cm',
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: undefined
      }
    };
    
    return configs[sensorName] || {
      label: sensorName,
      unit: '',
      beginAtZero: false,
      suggestedMin: undefined,
      suggestedMax: undefined
    };
  };

  const sensorConfig = getSensorConfig(sensorName);

  // Chart-Konfiguration mit Kategorie-Achsen statt Zeitachsen
  const chartData = {
    labels: data.data ? data.data.map(item => {
      const date = new Date(item.time);
      return date.toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }) : [],
    datasets: [
      {
        label: sensorConfig.label,
        data: data.data ? data.data.map(item => parseFloat(item.value)) : [],
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
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
          usePointStyle: true,
          padding: 20,
          color: '#2c3e50', // Dark color for light theme
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: `${sensorConfig.label} - Statistik`,
        color: '#2c3e50', // Dark color for light theme
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#ffffff',
        titleColor: '#2c3e50',
        bodyColor: '#2c3e50',
        borderColor: color,
        borderWidth: 2,
        cornerRadius: 8,
                 callbacks: {
           title: function(context) {
             const dataIndex = context[0].dataIndex;
             const originalDate = new Date(data.data[dataIndex].time);
             return originalDate.toLocaleString('de-DE', {
               day: '2-digit',
               month: '2-digit',
               year: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
             });
           },
           label: function(context) {
             return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}${sensorConfig.unit}`;
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
           color: '#2c3e50', // Dark color for light theme
           font: {
             size: 14,
             weight: 'bold'
           }
         },
         ticks: {
           color: '#2c3e50', // Dark color for light theme
           maxRotation: 45,
           minRotation: 45
         },
         grid: {
           color: '#bdc3c7', // Lighter grid for light theme
           drawBorder: false
         }
       },
      y: {
        title: {
          display: true,
          text: `${sensorConfig.label} (${sensorConfig.unit})`,
          color: '#2c3e50', // Dark color for light theme
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#2c3e50' // Dark color for light theme
        },
        beginAtZero: sensorConfig.beginAtZero,
        suggestedMin: sensorConfig.suggestedMin,
        suggestedMax: sensorConfig.suggestedMax,
        grid: {
          color: '#bdc3c7', // Lighter grid for light theme
          drawBorder: false
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 8,
        radius: 4
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-dark">Lade Statistik-Daten...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h6 className="alert-heading">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Fehler beim Laden der Daten
        </h6>
        <p className="mb-0">{error}</p>
        <hr />
        <p className="mb-0 small">
          <strong>API-Endpunkt:</strong> GET /api/data/stats/sensor?sensor={sensorName}&start={startDate}&end={endDate}
        </p>
      </div>
    );
  }

  if (!data.data || data.data.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        <h6 className="alert-heading">
          <i className="bi bi-info-circle me-2"></i>
          Keine Daten verfügbar
        </h6>
        <p className="mb-0">
          Für den Sensor "{sensorConfig.label}" wurden im gewählten Zeitraum keine Messwerte gefunden.
        </p>
        <hr />
        <p className="mb-0 small">
          <strong>Zeitraum:</strong> {startDate} bis {endDate}
        </p>
      </div>
    );
  }

  // Validiere, dass alle erforderlichen Statistik-Werte vorhanden sind
  const hasValidStats = data.min !== undefined && 
                       data.max !== undefined && 
                       data.avg !== undefined &&
                       !isNaN(parseFloat(data.min)) &&
                       !isNaN(parseFloat(data.max)) &&
                       !isNaN(parseFloat(data.avg));

  return (
    <div>
      <div style={{ height: '400px' }}>
        <Line data={chartData} options={options} />
      </div>
      
             {/* Statistik-Übersicht */}
       {hasValidStats && (
         <div className="row mt-4">
                       <div className="col-md-4">
              <div className="card bg-light text-dark border-secondary">
                <div className="card-body text-center">
                  <h6 className="card-title text-dark">Minimum</h6>
                  <h4 className="text-danger mb-0">{parseFloat(data.min).toFixed(1)}{sensorConfig.unit}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-light text-dark border-secondary">
                <div className="card-body text-center">
                <h6 className="card-title text-dark">Durchschnitt</h6>
                  <h4 className="text-primary mb-0">{parseFloat(data.avg).toFixed(1)}{sensorConfig.unit}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-light text-dark border-secondary">
                <div className="card-body text-center">
                  <h6 className="card-title text-dark">Maximum</h6>
                  <h4 className="text-success mb-0">{parseFloat(data.max).toFixed(1)}{sensorConfig.unit}</h4>
                </div>
              </div>
            </div>
         </div>
       )}
      
      {/* Daten-Info */}
      <div className="mt-3">
        <small className="text-dark">
          <i className="bi bi-info-circle me-1"></i>
          {data.data ? data.data.length : 0} Messwerte • 
          Zeitraum: {startDate} bis {endDate} • 
          Letzte Aktualisierung: {new Date().toLocaleString('de-DE')}
        </small>
      </div>
    </div>
  );
};

export default StatsChart;
