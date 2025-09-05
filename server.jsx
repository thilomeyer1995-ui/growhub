import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from current working directory (.env)
// When running from dist/, the .env file should be in the same directory
const envPath = path.join(process.cwd(), '.env');
console.log(`🔍 Current working directory: ${process.cwd()}`);
console.log(`🔍 Trying to load .env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(`❌ Error loading .env file from ${envPath}`);
  console.error('Please ensure the .env file exists in the dist directory.');
  console.error('Run "npm run build" to create the dist directory with .env file.');
  process.exit(1);
}

console.log(`✅ Environment variables loaded from ${envPath}`);

// Environment variables loaded successfully

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting (fixes X-Forwarded-For error)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images
app.use('/uploads', express.static('/root/image'));

// API route for accessing uploaded images
app.use('/api/uploadImages', express.static('/root/image'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes will be loaded dynamically after environment variables

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'GrowHub Data API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      time: 'GET /api/time',
      uploadImage: 'POST /api/uploadImage (multipart/form-data with image field)',
      uploadRawImage: 'POST /api/uploadRawImage (raw binary JPEG data)',
      createData: 'POST /api/data (requires authentication)',
      latestData: 'GET /api/data/latest',
      dataStats: 'GET /api/data/stats',
      allData: 'GET /api/data?limit=100&offset=0'
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Dynamically import database and routes modules after env vars are loaded
    const { initDatabase } = await import('./models/DB.jsx');
    const dataRoutesModule = await import('./routes/Data.jsx');
  const dataRoutes = dataRoutesModule.default;
  // VideoProxy importieren und einbinden
  const videoProxyModule = await import('./routes/VideoProxy.jsx');
  const videoProxyRoutes = videoProxyModule.default;
  // Setup API routes
  app.use('/api', dataRoutes);
  app.use('/api', videoProxyRoutes);
  // Initialize database tables and indexes
  await initDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 GrowHub Backend API running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API documentation: http://localhost:${PORT}/api`);
      console.log(`🌐 Frontend will run on: http://localhost:8080/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();
