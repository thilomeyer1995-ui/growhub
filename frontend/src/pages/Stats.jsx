import React, { useState } from 'react';
import StatsChart from '../components/StatsChart';

const Stats = () => {
  // State für die Formular-Elemente
  const [selectedSensor, setSelectedSensor] = useState('temperature');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [activeTimeRange, setActiveTimeRange] = useState('7days'); // '24h', '7days', '30days'

  // Automatisch den Zeitraum der letzten Woche vorauswählen
  React.useEffect(() => {
    setDefaultDateRange();
  }, []);

  // Verfügbare Sensoren
  const sensors = [
    { value: 'humidity', label: 'Luftfeuchtigkeit', color: '#3498db' },
    { value: 'temperature', label: 'Temperatur', color: '#e74c3c' },
    { value: 'plant1_moisture', label: 'Pflanze 1 - Bodenfeuchtigkeit', color: '#27ae60' },
    { value: 'plant2_moisture', label: 'Pflanze 2 - Bodenfeuchtigkeit', color: '#f39c12' },
    { value: 'plant3_moisture', label: 'Pflanze 3 - Bodenfeuchtigkeit', color: '#e67e22' },
    { value: 'distance_sensor', label: 'Wasserstand', color: '#9b59b6' }
  ];

  // Aktuell ausgewählter Sensor für Chart-Farben
  const currentSensor = sensors.find(sensor => sensor.value === selectedSensor);

  // Handler für Statistik-Anzeige
  const handleShowStats = () => {
    if (!startDate || !endDate) {
      alert('Bitte wählen Sie Start- und Enddatum aus.');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      alert('Das Startdatum muss vor dem Enddatum liegen.');
      return;
    }

    setIsLoading(true);
    setShowChart(true);
    
    // Loading wird von der StatsChart-Komponente verwaltet
    setIsLoading(false);
  };

  // Setze Standard-Datum (letzte 7 Tage)
  const setDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setActiveTimeRange('7days');
  };

  return (
    <div className="row">
      <div className="col-12">
        <h1 className="mb-4 text-light">Statistik</h1>
        
        {/* Konfigurations-Card */}
        <div className="card shadow-sm mb-4 bg-light text-dark border-secondary">
          <div className="card-header bg-primary text-white">
            <h5 className="card-title mb-0">
              <i className="bi bi-gear me-2"></i>
              Statistik-Konfiguration
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {/* Sensor-Auswahl */}
              <div className="col-12 col-md-4">
                <label htmlFor="sensorSelect" className="form-label">
                  <i className="bi bi-sensor me-1"></i>
                  Sensor auswählen
                </label>
                <select
                  id="sensorSelect"
                  className="form-select bg-white text-dark"
                  value={selectedSensor}
                  onChange={(e) => setSelectedSensor(e.target.value)}
                >
                  {sensors.map(sensor => (
                    <option key={sensor.value} value={sensor.value}>
                      {sensor.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start-Datum */}
              <div className="col-12 col-md-3">
                <label htmlFor="startDate" className="form-label">
                  <i className="bi bi-calendar-event me-1"></i>
                  Start-Datum
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="form-control bg-white text-dark"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* End-Datum */}
              <div className="col-12 col-md-3">
                <label htmlFor="endDate" className="form-label">
                  <i className="bi bi-calendar-event me-1"></i>
                  End-Datum
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="form-control bg-white text-dark"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Aktionen */}
              <div className="col-12 col-md-2">
                <label className="form-label">&nbsp;</label>
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn btn-primary text-white"
                    onClick={handleShowStats}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Lädt...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-graph-up me-1"></i>
                        Statistik anzeigen
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Schnell-Aktionen */}
            <div className="row mt-4">
              <div className="col-12">
                <h6 className="text-muted mb-3">
                  <i className="bi bi-lightning me-2"></i>
                  Schnell-Zeiträume
                </h6>
                                 <div className="d-flex flex-wrap gap-2">
                   <button
                     type="button"
                     className={`btn btn-sm px-3 py-2 ${activeTimeRange === '24h' ? 'btn-success' : 'btn-outline-secondary'}`}
                     onClick={() => {
                       const end = new Date();
                       const start = new Date();
                       start.setDate(start.getDate() - 1);
                       setStartDate(start.toISOString().split('T')[0]);
                       setEndDate(end.toISOString().split('T')[0]);
                       setActiveTimeRange('24h');
                     }}
                   >
                     <i className="bi bi-calendar-day me-2"></i>
                     <strong>24 Stunden</strong>
                     <small className={`d-block ${activeTimeRange === '24h' ? 'text-white' : 'text-muted'}`}>Letzter Tag</small>
                   </button>
                   <button
                     type="button"
                     className={`btn btn-sm px-3 py-2 ${activeTimeRange === '7days' ? 'btn-success' : 'btn-outline-secondary'}`}
                     onClick={setDefaultDateRange}
                   >
                     <i className="bi bi-calendar-week me-2"></i>
                     <strong>7 Tage</strong>
                     <small className={`d-block ${activeTimeRange === '7days' ? 'text-white' : 'text-muted'}`}>Letzte Woche</small>
                   </button>
                   <button
                     type="button"
                     className={`btn btn-sm px-3 py-2 ${activeTimeRange === '30days' ? 'btn-success' : 'btn-outline-secondary'}`}
                     onClick={() => {
                       const end = new Date();
                       const start = new Date();
                       start.setDate(start.getDate() - 30);
                       setStartDate(start.toISOString().split('T')[0]);
                       setEndDate(end.toISOString().split('T')[0]);
                       setActiveTimeRange('30days');
                     }}
                   >
                     <i className="bi bi-calendar-month me-2"></i>
                     <strong>30 Tage</strong>
                     <small className={`d-block ${activeTimeRange === '30days' ? 'text-white' : 'text-muted'}`}>Letzter Monat</small>
                   </button>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart-Bereich */}
        {showChart && (
          <div className="card shadow-sm bg-light text-dark border-secondary">
            <div className="card-header bg-secondary text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-graph-up me-2"></i>
                {currentSensor?.label} - Statistik
                <small className="text-light ms-2">
                  {startDate} bis {endDate}
                </small>
              </h5>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                  <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="">Lade Statistik-Daten...</p>
                  </div>
                </div>
                             ) : (
                 <div className="row">
                   <div className="col-12">
                     <StatsChart 
                       sensorName={selectedSensor}
                       startDate={startDate}
                       endDate={endDate}
                       color={currentSensor?.color}
                     />
                   </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* Info-Sektion */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm bg-light text-dark border-secondary">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-info-circle me-2"></i>
                  Statistik-Funktionen
                </h5>
                <div className="row">
                  <div className="col-md-6">
                    <h6>Verfügbare Sensoren</h6>
                    <ul className="list-unstyled">
                      {sensors.map(sensor => (
                        <li key={sensor.value} className="mb-1">
                          <i className="bi bi-circle-fill me-2" style={{ color: sensor.color, fontSize: '0.5rem' }}></i>
                          {sensor.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>Funktionen</h6>
                    <ul className="list-unstyled">
                      <li><i className="bi bi-check-circle text-success me-2"></i>Zeitraum-Auswahl</li>
                      <li><i className="bi bi-check-circle text-success me-2"></i>Sensor-spezifische Charts</li>
                      <li><i className="bi bi-check-circle text-success me-2"></i>Responsive Darstellung</li>
                      <li><i className="bi bi-check-circle text-success me-2"></i>Interaktive Diagramme</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
