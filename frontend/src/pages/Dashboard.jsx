import React from 'react';
import SensorChart from '../components/SensorChart';
import SensorStats from '../components/SensorStats';

const Dashboard = () => {
  return (
    <div className="row">
      <div className="col-12">
        <h1 className="mb-4 text-light">Dashboard</h1>

        {/* Current Sensor Values */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-6 col-lg-3">
            <SensorStats
              sensorName="temperature"
              title="Aktuelle Temperatur"
              icon="bi bi-thermometer-half"
              unit="Temperatur"
              color="#e74c3c"
            />
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <SensorStats
              sensorName="humidity"
              title="Aktuelle Luftfeuchtigkeit"
              icon="bi bi-droplet-half"
              unit="Luftfeuchtigkeit"
              color="#3498db"
            />
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <SensorStats
              sensorName="plant1_moisture"
              title="Pflanze 1 - Bodenfeuchtigkeit"
              icon="bi bi-moisture"
              unit="Bodenfeuchtigkeit"
              color="#27ae60"
            />
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <SensorStats
              sensorName="plant2_moisture"
              title="Pflanze 2 - Bodenfeuchtigkeit"
              icon="bi bi-moisture"
              unit="Bodenfeuchtigkeit"
              color="#f39c12"
            />
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <SensorStats
              sensorName="plant3_moisture"
              title="Pflanze 3 - Bodenfeuchtigkeit"
              icon="bi bi-moisture"
              unit="Bodenfeuchtigkeit"
              color="#e67e22"
            />
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <SensorStats
              sensorName="distance_sensor"
              title="Wasserstand"
              icon="bi bi-arrow-up-circle"
              unit="Distanz"
              color="#9b59b6"
            />
          </div>
          {/* Lichtsensor Kachel */}
          <div className="col-12 col-md-6 col-lg-3">
            <SensorStats
              sensorName="light_sensor"
              title="Lichtstatus"
              icon="bi bi-lightbulb-fill"
              unit="Licht an/aus"
              color="#f1c40f"
            />
          </div>
        </div>

        {/* Sensor Charts */}
        <div className="row g-4">
          {/* Temperatur Chart */}
          <div className="col-12">
            <SensorChart
              sensorName="temperature"
              title="Temperaturverlauf - Letzte 7 Tage"
              color="#e74c3c"
            />
          </div>

          {/* Luftfeuchtigkeit Chart */}
          <div className="col-12">
            <SensorChart
              sensorName="humidity"
              title="Luftfeuchtigkeitsverlauf - Letzte 7 Tage"
              color="#3498db"
            />
          </div>

          {/* Bodenfeuchtigkeit Charts */}
          <div className="col-12 ">
            <SensorChart
              sensorName="plant1_moisture"
              title="Pflanze 1 - Bodenfeuchtigkeit - Letzte 7 Tage"
              color="#27ae60"
            />
          </div>

          <div className="col-12 ">
            <SensorChart
              sensorName="plant2_moisture"
              title="Pflanze 2 - Bodenfeuchtigkeit - Letzte 7 Tage"
              color="#f39c12"
            />
          </div>

          <div className="col-12">
            <SensorChart
              sensorName="plant3_moisture"
              title="Pflanze 3 - Bodenfeuchtigkeit - Letzte 7 Tage"
              color="#e67e22"
            />
          </div>

          {/* Wasserstand Chart */}
          <div className="col-12">
            <SensorChart
              sensorName="distance_sensor"
              title="Wasserstand - Letzte 7 Tage"
              color="#9b59b6"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
