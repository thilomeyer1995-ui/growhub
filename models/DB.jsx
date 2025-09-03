import { Pool } from 'pg';
// Entferne dotenv.config() hier, da es bereits im Server geladen wird

// Database connection will use environment variables loaded by server.jsx

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Database initialization
export const initDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS measurements (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS measurement_values (
        id SERIAL PRIMARY KEY,
        measurement_id INT REFERENCES measurements(id) ON DELETE CASCADE,
        sensor_name TEXT NOT NULL,
        value NUMERIC NOT NULL
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_measurements_created_at ON measurements(created_at);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_measurement_values_measurement_id ON measurement_values(measurement_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_measurement_values_sensor_name ON measurement_values(sensor_name);
    `);

    client.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Create new measurement
export const createMeasurement = async () => {
  try {
    const result = await pool.query(
      'INSERT INTO measurements DEFAULT VALUES RETURNING id, created_at'
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating measurement:', error);
    throw error;
  }
};

// Insert measurement values
export const insertMeasurementValues = async (measurementId, sensorData) => {
  try {
    const values = sensorData.map(data => 
      `(${measurementId}, '${data.sensor_name}', ${data.value})`
    ).join(', ');

    const query = `
      INSERT INTO measurement_values (measurement_id, sensor_name, value)
      VALUES ${values}
    `;

    await pool.query(query);
    return true;
  } catch (error) {
    console.error('Error inserting measurement values:', error);
    throw error;
  }
};

// Get latest measurements per sensor
export const getLatestMeasurements = async () => {
  try {
    const query = `
      SELECT DISTINCT ON (mv.sensor_name) 
        mv.sensor_name,
        mv.value,
        m.created_at
      FROM measurement_values mv
      JOIN measurements m ON mv.measurement_id = m.id
      ORDER BY mv.sensor_name, m.created_at DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error getting latest measurements:', error);
    throw error;
  }
};

// Get aggregated statistics per sensor
export const getSensorStats = async () => {
  try {
    const query = `
      SELECT 
        sensor_name,
        MIN(value) as min_value,
        MAX(value) as max_value,
        AVG(value) as avg_value,
        COUNT(*) as measurement_count
      FROM measurement_values
      GROUP BY sensor_name
      ORDER BY sensor_name
    `;

    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error getting sensor stats:', error);
    throw error;
  }
};

// Get measurements with pagination
export const getMeasurements = async (limit = 100, offset = 0) => {
  try {
    const query = `
      SELECT 
        m.id,
        m.created_at,
        json_agg(
          json_build_object(
            'sensor_name', mv.sensor_name,
            'value', mv.value
          )
        ) as sensors
      FROM measurements m
      LEFT JOIN measurement_values mv ON m.id = mv.measurement_id
      GROUP BY m.id, m.created_at
      ORDER BY m.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  } catch (error) {
    console.error('Error getting measurements:', error);
    throw error;
  }
};

// Get sensor data within a time range
export const getSensorDataByTimeRange = async (sensorName, startTime, endTime, limit = 1000) => {
  try {
    const query = `
      SELECT 
        mv.sensor_name,
        mv.value,
        m.created_at
      FROM measurement_values mv
      JOIN measurements m ON mv.measurement_id = m.id
      WHERE mv.sensor_name = $1 
        AND m.created_at >= $2 
        AND m.created_at <= $3
      ORDER BY m.created_at ASC
      LIMIT $4
    `;

    const result = await pool.query(query, [sensorName, startTime, endTime, limit]);
    return result.rows;
  } catch (error) {
    console.error('Error getting sensor data by time range:', error);
    throw error;
  }
};

// Get sensor statistics with data for a specific time range
export const getSensorStatsWithData = async (sensorName, startTime, endTime, limit = 1000) => {
  try {
    // Get the data points
    const dataQuery = `
      SELECT 
        mv.sensor_name,
        mv.value,
        m.created_at as time
      FROM measurement_values mv
      JOIN measurements m ON mv.measurement_id = m.id
      WHERE mv.sensor_name = $1 
        AND m.created_at >= $2 
        AND m.created_at <= $3
      ORDER BY m.created_at ASC
      LIMIT $4
    `;

    // Get the statistics
    const statsQuery = `
      SELECT 
        MIN(value) as min,
        MAX(value) as max,
        AVG(value) as avg,
        COUNT(*) as count
      FROM measurement_values mv
      JOIN measurements m ON mv.measurement_id = m.id
      WHERE mv.sensor_name = $1 
        AND m.created_at >= $2 
        AND m.created_at <= $3
    `;

    const [dataResult, statsResult] = await Promise.all([
      pool.query(dataQuery, [sensorName, startTime, endTime, limit]),
      pool.query(statsQuery, [sensorName, startTime, endTime])
    ]);

    return {
      sensor: sensorName,
      data: dataResult.rows,
      min: parseFloat(statsResult.rows[0]?.min) || 0,
      max: parseFloat(statsResult.rows[0]?.max) || 0,
      avg: parseFloat(statsResult.rows[0]?.avg) || 0,
      count: parseInt(statsResult.rows[0]?.count) || 0
    };
  } catch (error) {
    console.error('Error getting sensor stats with data:', error);
    throw error;
  }
};

export default pool;
