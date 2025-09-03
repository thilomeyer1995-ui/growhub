import {
  createMeasurement,
  insertMeasurementValues,
  getLatestMeasurements,
  getSensorStats,
  getMeasurements,
  getSensorDataByTimeRange,
  getSensorStatsWithData
} from '../models/DB.jsx';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Middleware for raw data (bypasses JSON parsing)
export const rawDataMiddleware = (req, res, next) => {
  let data = '';

  req.setEncoding('binary');

  req.on('data', (chunk) => {
    data += chunk;
  });

  req.on('end', () => {
    req.rawBody = Buffer.from(data, 'binary');
    next();
  });

  req.on('error', (err) => {
    next(err);
  });
};

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/root/image';
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Check if custom filename is provided in request
    const customName = req.body.filename || req.query.filename;

    if (customName) {
      // Use custom filename with original extension
      const extension = path.extname(file.originalname);
      const nameWithoutExt = customName.replace(/\.[^/.]+$/, '');
      cb(null, `${nameWithoutExt}${extension}`);
    } else {
      // Generate unique filename with timestamp (default behavior)
      const timestamp = Date.now();
      const originalName = file.originalname.replace(/\.[^/.]+$/, ''); // Remove extension
      const extension = path.extname(file.originalname);
      cb(null, `${originalName}_${timestamp}${extension}`);
    }
  }
});

// File filter for JPEG images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG images are allowed'), false);
  }
};

// Configure multer upload
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one file at a time
  }
});

// POST /uploadImage - Upload JPEG image
export const uploadImage = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a JPEG image file'
      });
    }

    // File upload successful
    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadPath: req.file.path,
        serverPath: '/root/image/' + req.file.filename,
        accessUrl: '/uploads/' + req.file.filename,
        apiAccessUrl: '/api/uploadImages/' + req.file.filename,
        uploadTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error uploading image:', error);

    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large',
          message: 'File size must be less than 10MB'
        });
      }
    }

    res.status(500).json({
      error: 'Upload failed',
      message: 'Failed to upload image'
    });
  }
};

// POST /uploadRawImage - Upload raw JPEG data directly
export const uploadRawImage = async (req, res) => {
  try {
    // Get raw data from request
    let buffer;

    // Try to get raw data from different sources
    if (req.rawBody) {
      // If raw body middleware is available
      buffer = Buffer.from(req.rawBody);
    } else if (req.body && Buffer.isBuffer(req.body)) {
      // If body is already a buffer
      buffer = req.body;
    } else if (req.body && typeof req.body === 'string') {
      // If body is a string (base64)
      if (req.body.startsWith('data:image/jpeg;base64,')) {
        const base64Data = req.body.replace('data:image/jpeg;base64,', '');
        buffer = Buffer.from(base64Data, 'base64');
      } else {
        // Assume it's already base64 without prefix
        buffer = Buffer.from(req.body, 'base64');
      }
    } else if (req.body && req.body.length > 0) {
      // If body has content, try to convert it
      try {
        buffer = Buffer.from(req.body);
      } catch (err) {
        return res.status(400).json({
          error: 'Invalid data format',
          message: 'Could not convert request body to buffer'
        });
      }
    } else {
      return res.status(400).json({
        error: 'No image data',
        message: 'Please provide raw JPEG data in request body'
      });
    }

    // Validate JPEG header (starts with 0xFF 0xD8)
    if (buffer.length < 2 || buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
      return res.status(400).json({
        error: 'Invalid JPEG format',
        message: 'Data does not appear to be valid JPEG (missing JPEG header)'
      });
    }

    // Generate filename with timestamp
    const timestamp = Date.now();
    const filename = `${timestamp}.jpg`;
    const uploadDir = '/root/image';
    const filePath = path.join(uploadDir, filename);

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write raw data to file
    fs.writeFileSync(filePath, buffer);

    // Get file stats
    const stats = fs.statSync(filePath);

    res.status(201).json({
      success: true,
      message: 'Raw JPEG image uploaded successfully',
      data: {
        filename: filename,
        size: stats.size,
        mimetype: 'image/jpeg',
        uploadPath: filePath,
        serverPath: '/root/image/' + filename,
        accessUrl: '/uploads/' + filename,
        apiAccessUrl: '/api/uploadImages/' + filename,
        uploadTime: new Date().toISOString(),
        dataFormat: 'raw_jpeg_stream'
      }
    });

  } catch (error) {
    console.error('Error uploading raw image:', error);

    res.status(500).json({
      error: 'Upload failed',
      message: 'Failed to upload raw JPEG image',
      details: error.message
    });
  }
};

// POST /data - Create new measurement with sensor values
export const createData = async (req, res) => {
  try {
    const { sensors } = req.body;
    const { mock } = req.query; // Query parameter für Mock-Modus

    // Validate request body
    if (!sensors || !Array.isArray(sensors) || sensors.length === 0) {
      return res.status(400).json({
        error: 'Invalid request body',
        message: 'Request body must contain a "sensors" array with sensor data'
      });
    }

    // Validate sensor data structure
    for (const sensor of sensors) {
      if (!sensor.sensor_name || typeof sensor.value !== 'number') {
        return res.status(400).json({
          error: 'Invalid sensor data',
          message: 'Each sensor must have "sensor_name" (string) and "value" (number)'
        });
      }
    }

    // Process sensors - Feuchtigkeitsumrechnung ist immer aktiviert
    let processedSensors = sensors;

    // Feuchtigkeitssensoren werden immer umgerechnet (unabhängig vom Mock-Parameter)
    processedSensors = sensors.map(sensor => {
      const { sensor_name, value } = sensor;

      // Switch case für Wert-Anpassung
      switch (sensor_name) {
        case 'humidity':
          return sensor; // Unverändert

        case 'temperature':
          return sensor; // Unverändert

        case 'plant1_moisture':
          // Bodenfeuchtigkeit Pflanze 1: 250-1023 → 100%-0% umrechnen
          // 250 = sehr nass (100%), 1023 = sehr trocken (0%)
          // Werte außerhalb des Bereichs werden auf den Rand gesetzt
          let moisture1 = value;
          if (value < 250) moisture1 = 250;      // Unter 250 → 250 (100%)
          if (value > 1023) moisture1 = 1023;    // Über 1023 → 1023 (0%)
          const percentage1 = Math.round(((1023 - moisture1) / (1023 - 250)) * 100);
          return { ...sensor, value: percentage1 };

        case 'plant2_moisture':
          // Bodenfeuchtigkeit Pflanze 2: 250-1023 → 100%-0% umrechnen
          // 250 = sehr nass (100%), 1023 = sehr trocken (0%)
          // Werte außerhalb des Bereichs werden auf den Rand gesetzt
          let moisture2 = value;
          if (value < 250) moisture2 = 250;      // Unter 250 → 250 (100%)
          if (value > 1023) moisture2 = 1023;    // Über 1023 → 1023 (0%)
          const percentage2 = Math.round(((1023 - moisture2) / (1023 - 250)) * 100);
          return { ...sensor, value: percentage2 };

        case 'plant3_moisture':
          // Bodenfeuchtigkeit Pflanze 3: 250-1023 → 100%-0% umrechnen
          // 250 = sehr nass (100%), 1023 = sehr trocken (0%)
          // Werte außerhalb des Bereichs werden auf den Rand gesetzt
          let moisture3 = value;
          if (value < 250) moisture3 = 250;      // Unter 250 → 250 (100%)
          if (value > 1023) moisture3 = 1023;    // Über 1023 → 1023 (0%)
          const percentage3 = Math.round(((1023 - moisture3) / (1023 - 250)) * 100);
          return { ...sensor, value: percentage3 };

          case 'distance_sensor':
           // Abstandssensor: misst Abstand in Zentimetern
           // Werte außerhalb des Bereichs werden auf den Rand gesetzt
           let distanceValue = value;
           if (value < 0) distanceValue = 0;      // Unter 0cm → 0cm
           if (value > 23) distanceValue = 23;    // Über 23cm → 23cm
           return { ...sensor, value: (23- distanceValue) };

        case 'light_sensor':
          // Lichtsensor: digital, nur 0 oder 1
          // 0 = licht an (hell), 1 = dunkel
          // Werte auf 0 oder 1 runden
          let lightValue = Math.round(value);
          if (lightValue !== 0 && lightValue !== 1) {
            lightValue = 0; // Standardwert: licht an
          }
          return { ...sensor, value: lightValue };

        default:
          // Unbekannte Sensoren unverändert lassen
          return sensor;
      }
    });

    // Mock-Logik für zusätzliche Filterung (nur wenn aktiviert)
    if (mock === 'true' || mock === '1') {
      processedSensors = processedSensors.filter(sensor => {
        const { sensor_name, value } = sensor;

        // Switch case für Sensor-Filterung (entfernen oder behalten)
        switch (sensor_name) {
          case 'humidity':
            return true; // Sensor behalten

          case 'temperature':
            return true; // Sensor behalten

          case 'plant1_moisture':
            return true; // Sensor behalten

          case 'plant2_moisture':
            return true; // Sensor behalten

          case 'plant3_moisture':
            return true; // Sensor behalten

          case 'distance_sensor':
            // Abstandssensor: Werte unter 0cm oder über 23cm ignorieren
            if (value < 0 || value > 23) {
              return false; // Sensor komplett entfernen
            }
            return true; // Sensor behalten

          case 'light_sensor':
            // Lichtsensor: Werte außerhalb 0-1 ignorieren
            if (value < 0 || value > 1) {
              return false; // Sensor komplett entfernen
            }
            return true; // Sensor behalten

          default:
            // Unbekannte Sensoren behalten
            return true;
        }
      });
    }

    // Create new measurement
    const measurement = await createMeasurement();

    // Insert processed sensor values
    await insertMeasurementValues(measurement.id, processedSensors);

    res.status(201).json({
      success: true,
      message: 'Measurement data created successfully',
      data: {
        measurement_id: measurement.id,
        created_at: measurement.created_at,
        sensors_count: processedSensors.length,
        sensors: processedSensors,
        mock_enabled: mock === 'true' || mock === '1'
      }
    });

  } catch (error) {
    console.error('Error creating data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create measurement data'
    });
  }
};

// GET /data/latest - Get latest measurements per sensor
export const getLatestData = async (req, res) => {
  try {
    const latestMeasurements = await getLatestMeasurements();

    res.json({
      success: true,
      data: {
        measurements: latestMeasurements,
        count: latestMeasurements.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting latest data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve latest measurements'
    });
  }
};

// GET /data/stats - Get aggregated statistics per sensor
export const getDataStats = async (req, res) => {
  try {
    const stats = await getSensorStats();

    // Calculate additional statistics
    const enhancedStats = stats.map(stat => ({
      ...stat,
      avg_value: parseFloat(stat.avg_value),
      range: stat.max_value - stat.min_value
    }));

    res.json({
      success: true,
      data: {
        statistics: enhancedStats,
        total_sensors: enhancedStats.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting data stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve sensor statistics'
    });
  }
};

// GET /data - Get all measurements with pagination
export const getAllData = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    // Validate pagination parameters
    if (limit < 1 || limit > 1000) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        message: 'Limit must be between 1 and 1000'
      });
    }

    if (offset < 0) {
      return res.status(400).json({
        error: 'Invalid offset parameter',
        message: 'Offset must be 0 or greater'
      });
    }

    const measurements = await getMeasurements(limit, offset);

    res.json({
      success: true,
      data: {
        measurements: measurements,
        pagination: {
          limit,
          offset,
          count: measurements.length
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting all data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve measurements'
    });
  }
};

// GET /data/sensor/:sensorName - Get sensor data within a time range
export const getSensorDataByTimeRangeController = async (req, res) => {
  try {
    const { sensorName } = req.params;
    const { start_time, end_time, limit } = req.query;

    // Validate required parameters
    if (!sensorName) {
      return res.status(400).json({
        error: 'Missing parameter',
        message: 'sensorName parameter is required'
      });
    }

    if (!start_time || !end_time) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Both start_time and end_time query parameters are required'
      });
    }

    // Validate and parse time parameters
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json({
        error: 'Invalid time format',
        message: 'start_time and end_time must be valid ISO 8601 date strings'
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        error: 'Invalid time range',
        message: 'start_time must be before end_time'
      });
    }

    // Validate limit parameter
    const maxLimit = parseInt(limit) || 1000;
    if (maxLimit < 1 || maxLimit > 10000) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        message: 'Limit must be between 1 and 10000'
      });
    }

    // Get sensor data
    const sensorData = await getSensorDataByTimeRange(sensorName, startTime, endTime, maxLimit);

    res.json({
      success: true,
      data: {
        sensor_name: sensorName,
        time_range: {
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString()
        },
        measurements: sensorData,
        count: sensorData.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting sensor data by time range:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve sensor data'
    });
  }
};

// GET /data/stats - Get sensor statistics with data for a specific time range
export const getSensorStatsWithDataController = async (req, res) => {
  try {
    const { sensor, start, end, limit } = req.query;

    // Validate required parameters
    if (!sensor) {
      return res.status(400).json({
        error: 'Missing parameter',
        message: 'sensor parameter is required'
      });
    }

    if (!start || !end) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Both start and end query parameters are required'
      });
    }

    // Validate and parse time parameters
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json({
        error: 'Invalid time format',
        message: 'start and end must be valid ISO 8601 date strings'
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        error: 'Invalid time range',
        message: 'start must be before end'
      });
    }

    // Validate limit parameter
    const maxLimit = parseInt(limit) || 1000;
    if (maxLimit < 1 || maxLimit > 10000) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        message: 'Limit must be between 1 and 10000'
      });
    }

    // Get sensor statistics with data
    const statsData = await getSensorStatsWithData(sensor, startTime, endTime, maxLimit);

    res.json({
      success: true,
      data: statsData
    });

  } catch (error) {
    console.error('Error getting sensor stats with data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve sensor statistics'
    });
  }
};

// Health check endpoint
export const healthCheck = async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'GrowHub Data API',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
};
