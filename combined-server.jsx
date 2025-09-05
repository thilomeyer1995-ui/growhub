// combined-server.jsx
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Aktuelles Verzeichnis bestimmen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env laden
const envPath = path.join(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(`❌ Fehler beim Laden der .env unter ${envPath}`);
  process.exit(1);
}

console.log(`✅ Environment variables loaded from ${envPath}`);

const app = express();
const PORT = process.env.PORT || 80;

// Proxy-Header für Rate-Limit etc.
app.set('trust proxy', 1);

/*
// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: false, // 🚫 HSTS deaktivieren
  })
);
*/
// CORS (alle Origins erlaubt für Testprojekt)
app.use(cors({ origin: true, credentials: true }));

// Rate limiting - weniger restriktiv für Entwicklung
// Kann durch Umgebungsvariable DISABLE_RATE_LIMIT=true deaktiviert werden
if (process.env.DISABLE_RATE_LIMIT !== 'true') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minuten
    max: 3000, // Erhöht von 100 auf 1000
    message: { error: 'Too many requests', message: 'Please try again later' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip rate limiting for static assets
    skip: (req) => {
      // Skip rate limiting for static files
      if (req.path.match(/\.(js|css|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
        return true;
      }
      // Skip rate limiting for API health checks
      if (req.path === '/api/health') {
        return true;
      }
      // Skip rate limiting for root path
      if (req.path === '/') {
        return true;
      }
      return false;
    }
  });
  app.use(limiter);
  console.log('✅ Rate limiting aktiviert (1000 requests/15min)');
} else {
  console.log('⚠️  Rate limiting deaktiviert (DISABLE_RATE_LIMIT=true)');
}

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images
app.use('/uploads', express.static('/root/image'));

// API route for accessing uploaded images
app.use('/api/uploadImages', express.static('/root/image'));

// Request logging für Debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// --- API-Routen --- //
const startServer = async () => {
  try {
  // DB + Routen erst importieren, wenn .env geladen ist
  const { initDatabase } = await import('./models/DB.jsx');
  const dataRoutesModule = await import('./routes/Data.jsx');
  const dataRoutes = dataRoutesModule.default;
  // VideoProxy-Route importieren und einbinden
  const videoProxyModule = await import('./routes/VideoProxy.jsx');
  const videoProxyRoutes = videoProxyModule.default;

  // API unter /api
  app.use('/api', dataRoutes);
  app.use('/api', videoProxyRoutes);

    // API Info
    app.get('/api', (req, res) => {
      res.json({
        message: 'GrowHub Data API',
        version: '1.0.0',
        endpoints: {
          health: 'GET /api/health',
          time: 'GET /api/time',
          uploadImage: 'POST /api/uploadImage (multipart/form-data with image field)',
          createData: 'POST /api/data',
          latestData: 'GET /api/data/latest',
          dataStats: 'GET /api/data/stats',
          allData: 'GET /api/data?limit=100&offset=0',
        },
      });
    });

    // --- Frontend (React Build) --- //
    const publicPath = path.join(process.cwd(), 'public');
    app.use(express.static(publicPath));

    // React Router: alle non-API Requests an index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });

    // DB initialisieren
    await initDatabase();

    // Server starten
    app.listen(PORT, () => {
      console.log(`🚀 Combined Server läuft auf Port ${PORT}`);
      console.log(`🌐 Frontend: http://localhost/`);
      console.log(`🔗 API: http://localhost/api/health`);
    });
  } catch (error) {
    console.error('❌ Fehler beim Starten des Servers:', error);
    process.exit(1);
  }
};

// Shutdown-Handling
process.on('SIGTERM', () => {
  console.log('SIGTERM empfangen, shutdown...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT empfangen, shutdown...');
  process.exit(0);
});

// Start
startServer();
