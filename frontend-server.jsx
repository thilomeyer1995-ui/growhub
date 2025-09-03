import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from current working directory (.env)
const envPath = path.join(process.cwd(), '.env');
console.log(`🔍 Frontend Server - Current working directory: ${process.cwd()}`);
console.log(`🔍 Frontend Server - Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(`❌ Frontend Server - Error loading .env file from ${envPath}`);
  console.error('Please ensure the .env file exists in the dist directory.');
  process.exit(1);
}

console.log(`✅ Frontend Server - Environment variables loaded from ${envPath}`);

const app = express();
const PORT = process.env.FRONTEND_PORT || 80;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files from the React app build
app.use(express.static(path.join(process.cwd(), 'public')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`🌐 GrowHub Frontend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend: http://localhost/`);
  console.log(`🔗 Backend API: http://localhost:3000/api/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
