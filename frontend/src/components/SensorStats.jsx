import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../utils/api';

const SensorStats = ({ sensorName, title, icon, unit, color = '#2ecc71' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiEndpoints.latestData();
        
        if (result.success && result.data && result.data.measurements) {
          const sensorData = result.data.measurements.find(
            item => item && item.sensor_name === sensorName
          );
          
          // Validiere die Sensor-Daten
          if (sensorData && typeof sensorData.value !== 'undefined' && sensorData.value !== null) {
            setData(sensorData);
          } else {
            setData(null); // Keine gültigen Daten gefunden
          }
        } else {
          throw new Error(result.message || 'Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching latest data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestData();
    
    // Aktualisiere alle 30 Sekunden
    const interval = setInterval(fetchLatestData, 30000);
    
    return () => clearInterval(interval);
  }, [sensorName]);

  if (loading) {
    return (
      <div className="card shadow-sm h-100 bg-light text-dark border-secondary">
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-sm h-100 bg-light text-dark border-secondary">
        <div className="card-body text-center">
          <div className="alert alert-danger" role="alert">
            <small>Fehler beim Laden</small>
          </div>
        </div>
      </div>
    );
  }

  if (!data || typeof data.value === 'undefined' || data.value === null) {
    return (
      <div className="card shadow-sm h-100 bg-light text-dark border-secondary">
        <div className="card-body text-center">
          <div className="alert alert-warning" role="alert">
            <small>Keine Daten verfügbar für {sensorName}</small>
          </div>
        </div>
      </div>
    );
  }

  const formatValue = (value) => {
    // Prüfe ob value existiert und nicht null ist
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    
    // Konvertiere value zu einer Zahl
    const numValue = parseFloat(value);
    
    // Prüfe ob die Konvertierung erfolgreich war
    if (isNaN(numValue)) {
      return 'N/A';
    }
    
    if (sensorName === 'temperature') {
      return `${numValue.toFixed(1)}°C`;
    } else if (sensorName === 'humidity') {
      return `${numValue.toFixed(1)}%`;
    } else if (sensorName.includes('moisture')) {
      return `${numValue.toFixed(1)}%`;
    } else if (sensorName === 'distance_sensor') {
      return `${numValue.toFixed(1)} cm`;
    }
    return numValue.toFixed(1);
  };

  const formatTime = (timestamp) => {
    // Prüfe ob timestamp existiert und gültig ist
    if (!timestamp) {
      return 'Unbekannt';
    }
    
    const date = new Date(timestamp);
    
    // Prüfe ob das Datum gültig ist
    if (isNaN(date.getTime())) {
      return 'Ungültiges Datum';
    }
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Gerade eben';
    } else if (diffInMinutes < 60) {
      return `Vor ${diffInMinutes} Min`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `Vor ${diffInHours} Std`;
    }
  };

  return (
    <div className="card shadow-sm h-100 bg-light text-dark border-secondary">
      <div className="card-body text-center">
        <div className="d-flex align-items-center justify-content-center mb-3">
          <i className={`${icon} fs-1 me-3`} style={{ color: color }}></i>
          <div>
            <h6 className="card-title mb-0 text-dark">{title}</h6>
            <small className="text-muted">{unit}</small>
          </div>
        </div>
        
        <div className="mb-3">
          <h2 className="display-6 fw-bold" style={{ color: color }}>
            {formatValue(data.value)}
          </h2>
        </div>
        
        <div className="text-muted">
          <small>
            <i className="bi bi-clock me-1"></i>
            {formatTime(data.created_at)}
          </small>
        </div>
      </div>
    </div>
  );
};

export default SensorStats;
