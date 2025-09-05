import express from 'express';
import http from 'http';
import { pipeline } from 'stream';

const router = express.Router();

// Proxy DroidCam MJPEG stream
router.get('/video-proxy', async (req, res) => {
  // Nur eine Verbindung gleichzeitig zulassen
  if (router.currentStream) {
    console.log('[Livestream] Verbindung abgelehnt: Stream bereits aktiv.');
    res.status(429).send('Stream already in use. Only one client allowed.');
    return;
  }

  const droidcamUrl = 'http://95.33.55.126:4747/video';
  console.log('[Livestream] Verbindungsaufbau zu DroidCam:', droidcamUrl);
  const proxyReq = http.get(droidcamUrl, (proxyRes) => {
    if (proxyRes.statusCode !== 200) {
      console.error(`[Livestream] Fehler vom DroidCam-Server: Status ${proxyRes.statusCode}`);
      res.status(proxyRes.statusCode).end();
      return;
    }
    // Alle relevanten Header weitergeben
    Object.entries(proxyRes.headers).forEach(([key, value]) => {
      if (typeof value !== 'undefined') res.setHeader(key, value);
    });
    router.currentStream = res;
    console.log('[Livestream] Stream-Verbindung zum Client hergestellt.');
    pipeline(proxyRes, res, (err) => {
      router.currentStream = null;
      if (err) {
        console.error('[Livestream] Stream pipeline error:', err);
      } else {
        console.log('[Livestream] Stream-Verbindung zum Client beendet.');
      }
    });
  });

  proxyReq.on('error', (err) => {
    router.currentStream = null;
    console.error('[Livestream] Fehler beim Verbindungsaufbau zu DroidCam:', err);
    if (!res.headersSent) res.status(500).send('Fehler beim Verbinden zum Stream.');
  });

  req.on('close', () => {
    router.currentStream = null;
    proxyReq.destroy();
    console.log('[Livestream] Client-Verbindung geschlossen.');
  });
});

export default router;
