import express from 'express';
import { authenticateToken } from '../middleware/Auth.jsx';
import {
  createData,
  getLatestData,
  getDataStats,
  getAllData,
  getSensorDataByTimeRangeController,
  getSensorStatsWithDataController,
  healthCheck,
  uploadImage,
  uploadRawImage,
  rawDataMiddleware,
  upload
} from '../controllers/DataController.jsx';

const router = express.Router();

// Debug route to list all available routes
router.get('/routes', (req, res) => {
  const routes = [];
  
  // Get all registered routes
  router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the router
      const path = middleware.route.path;
      const methods = Object.keys(middleware.route.methods);
      methods.forEach(method => {
        routes.push({
          method: method.toUpperCase(),
          path: `/api${path}`,
          description: getRouteDescription(path, method)
        });
      });
    }
  });
  
  res.json({
    message: 'Available API routes',
    routes: routes,
    total: routes.length
  });
});

// Helper function to get route descriptions
function getRouteDescription(path, method) {
  const descriptions = {
    '/health': 'Health check endpoint',
    '/time': 'Get current server timestamp',
    '/uploadImage': 'Upload JPEG image file',
    '/data': 'Create new measurement data (POST) or get all data (GET)',
    '/data/latest': 'Get latest sensor measurements',
    '/data/stats': 'Get sensor statistics',
    '/data/stats/sensor': 'Get sensor-specific statistics',
    '/data/sensor/:sensorName': 'Get sensor data by time range',
    '/routes': 'List all available routes (this endpoint)'
  };
  
  return descriptions[path] || 'No description available';
}

// Health check endpoint (no authentication required)
router.get('/health', healthCheck);

// Time endpoint (no authentication required)
router.get('/time', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    unix: Date.now(),
    message: 'Current server time'
  });
});

// Image upload endpoint (no authentication required)
router.post('/uploadImage', upload.single('image'), uploadImage);

// Raw JPEG data upload endpoint (no authentication required)
router.post('/uploadRawImage', rawDataMiddleware, uploadRawImage);

// Data endpoints
router.post('/data', authenticateToken, createData);  // Only POST /data requires authentication
router.get('/data/latest', getLatestData);           // Public endpoint
router.get('/data/stats', getDataStats);             // Public endpoint (general stats)
router.get('/data/stats/sensor', getSensorStatsWithDataController); // Public endpoint (sensor-specific stats)
router.get('/data', getAllData);                     // Public endpoint
router.get('/data/sensor/:sensorName', getSensorDataByTimeRangeController); // Public endpoint

export default router;
