-- C:\Users\<DeinBenutzername>\.ssh\id_rsa

-- Plant Monitoring Database Schema
-- This file is automatically executed when the PostgreSQL container starts

-- Create measurements table
CREATE TABLE IF NOT EXISTS measurements (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT now()
);

-- Create measurement_values table
CREATE TABLE IF NOT EXISTS measurement_values (
  id SERIAL PRIMARY KEY,
  measurement_id INT REFERENCES measurements(id) ON DELETE CASCADE,
  sensor_name TEXT NOT NULL,
  value NUMERIC NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_measurements_created_at ON measurements(created_at);
CREATE INDEX IF NOT EXISTS idx_measurement_values_measurement_id ON measurement_values(measurement_id);
CREATE INDEX IF NOT EXISTS idx_measurement_values_sensor_name ON measurement_values(sensor_name);