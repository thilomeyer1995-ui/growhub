import React from 'react';

// Helper function to safely format temperature values
const formatTemperature = (value) => {
  if (value !== undefined && value !== null && !isNaN(value)) {
    return `${value.toFixed(1)}°C`;
  }
  return 'N/A';
};

const StatCards = ({ min, max, avg }) => {
  return (
    <div className="row">
      <div className="col-md-4 mb-3">
        <div className="card h-100 border-primary">
          <div className="card-body text-center">
            <h5 className="card-title text-primary">
              <i className="bi bi-thermometer-half me-2"></i>
              Minimale Temperatur
            </h5>
            <h2 className="card-text text-primary fw-bold">
              {formatTemperature(min)}
            </h2>
            <p className="card-text text-muted">Niedrigster gemessener Wert</p>
          </div>
        </div>
      </div>
      
      <div className="col-md-4 mb-3">
        <div className="card h-100 border-success">
          <div className="card-body text-center">
            <h5 className="card-title text-success">
              <i className="bi bi-thermometer-half me-2"></i>
              Durchschnittliche Temperatur
            </h5>
            <h2 className="card-text text-success fw-bold">
              {formatTemperature(avg)}
            </h2>
            <p className="card-text text-muted">Mittelwert aller Messungen</p>
          </div>
        </div>
      </div>
      
      <div className="col-md-4 mb-3">
        <div className="card h-100 border-danger">
          <div className="card-body text-center">
            <h5 className="card-title text-danger">
              <i className="bi bi-thermometer-half me-2"></i>
              Maximale Temperatur
            </h5>
            <h2 className="card-text text-danger fw-bold">
              {formatTemperature(max)}
            </h2>
            <p className="card-text text-muted">Höchster gemessener Wert</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
