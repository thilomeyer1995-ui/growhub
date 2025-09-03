# GrowHub - Arduino Monitoring Dashboard

Ein vollständiges Monitoring-System für Arduino-Sensoren mit React Frontend und Node.js Backend.

## 🚀 Schnellstart

### Voraussetzungen
- Node.js 18+ 
- PostgreSQL 12+
- npm oder yarn

### Installation

1. **Repository klonen:**
```bash
git clone <repository-url>
cd GrowHub
```

2. **Dependencies installieren:**
```bash
npm install
```

3. **Datenbank einrichten:**
```bash
# PostgreSQL-Datenbank erstellen
createdb growhub

# Oder mit Docker (siehe LOCAL_DB_SETUP.md)
```

4. **Umgebungsvariablen konfigurieren:**
```bash
# Nach dem Build wird env.example in dist/.env kopiert
# Bearbeiten Sie dist/.env mit Ihren Datenbankeinstellungen:
cp env.example dist/.env
# Bearbeiten Sie dist/.env mit einem Editor Ihrer Wahl
```

5. **Anwendung starten:**
```bash
# Development-Modus (Frontend + Backend)
npm run dev

# Produktions-Build
npm run build

# Produktions-Start (Kombinierter Server auf Port 80)
npm start

# Oder separat starten:
npm run start:backend  # Nur Backend auf Port 3000
npm run start:frontend # Nur Frontend auf Port 8080
npm run start:combined # Kombinierter Server auf Port 80
```

## 📁 Projektstruktur

```
GrowHub/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/      # React Komponenten
│   │   ├── pages/          # Seiten-Komponenten
│   │   ├── styles/         # SCSS Styles
│   │   └── utils/          # Utility-Funktionen
│   └── public/             # Statische Dateien
├── controllers/            # Express Controller
├── middleware/            # Express Middleware
├── models/               # Datenbank-Modelle
├── routes/               # Express Routen
├── dist/                 # Build-Ausgabe (enthält .env)
├── server.jsx           # Express Server
└── webpack.config.js    # Webpack Konfiguration
```

## ⚙️ Konfiguration

### Protokoll-Erkennung (HTTP/HTTPS)

Die Anwendung erkennt automatisch das verwendete Protokoll (HTTP oder HTTPS) und stellt sicher, dass alle Ressourcen über das gleiche Protokoll geladen werden:

- **Automatische Protokoll-Erkennung**: Das System erkennt, ob die Seite über HTTP oder HTTPS aufgerufen wird
- **Konsistente Asset-Ladung**: Alle JavaScript-, CSS- und andere Assets werden über das gleiche Protokoll geladen
- **Externe Ressourcen**: Bootstrap Icons werden dynamisch mit dem korrekten Protokoll geladen
- **Mixed Content Prevention**: Verhindert Probleme mit gemischten HTTP/HTTPS-Inhalten

**Technische Details:**
- Protokoll-Erkennung über `X-Forwarded-Proto` Header oder SSL-Verbindung
- Relative Pfade für alle lokalen Assets
- Dynamische Ladung externer Ressourcen basierend auf dem aktuellen Protokoll

### Umgebungsvariablen (.env)

Die Anwendung verwendet **ausschließlich** die `.env`-Datei im `dist`-Ordner. Diese wird automatisch beim Build erstellt.

**Wichtige Hinweise:**
- Die einzige `.env`-Datei befindet sich im `dist`-Ordner
- Bearbeiten Sie `dist/.env` nach dem Build mit Ihren Einstellungen
- Die `env.example` dient nur als Vorlage

**Erforderliche Umgebungsvariablen:**
```env
# Datenbank-Konfiguration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=growhub
DB_USER=postgres
DB_PASSWORD=your-password-here

# API-Konfiguration
API_TOKEN=your-secret-api-token-here
NODE_ENV=production
PORT=3000

# Optional: Logging
LOG_LEVEL=info
```

### Build-Prozess

1. **Development-Build:**
```bash
npm run build:dev
# Erstellt dist-dev/ mit .env
```

2. **Produktions-Build:**
```bash
npm run build
# Erstellt dist/ mit .env
```

3. **Anwendung starten:**
```bash
# Kombinierter Server starten (Port 80)
npm start

# Oder separat:
npm run start:backend  # Backend auf Port 3000
npm run start:frontend # Frontend auf Port 8080
npm run start:combined # Kombinierter Server auf Port 80
```

## 📋 Verfügbare Scripts

### Entwicklung
```bash
npm run dev              # Startet Backend und Frontend gleichzeitig
npm run dev:backend      # Nur Backend (Port 3000)
npm run dev:frontend     # Nur Frontend (Port 3001)
npm run dev:watch        # Backend mit Watch-Mode
```

### Build
```bash
npm run build            # Baut Backend und Frontend
npm run build:backend    # Nur Backend bauen
npm run build:frontend   # Nur Frontend bauen
```

### Production
```bash
npm start                # Startet Backend-Server
npm run start:frontend   # Startet Frontend-Development-Server
```

### Utilities
```bash
npm run clean            # Löscht alle Build-Ordner
npm run install:all      # Installiert alle Dependencies
```

## 🌐 Zugriff auf Services

- **Backend API:** http://localhost:3000
- **Frontend:** http://localhost:8080
- **API Health Check:** http://localhost:3000/api/health

## 🏗️ Projektstruktur

```
GrowHub/
├── package.json              # Einheitliche package.json für Backend + Frontend
├── webpack.config.js         # Backend Webpack-Konfiguration
├── server.jsx               # Backend-Server
├── controllers/             # Backend-Controller
├── models/                  # Datenbank-Modelle
├── routes/                  # API-Routen
├── middleware/              # Backend-Middleware
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/      # React-Komponenten
│   │   ├── pages/          # Seiten-Komponenten
│   │   ├── styles/         # SCSS-Styles
│   │   ├── App.jsx         # Haupt-App-Komponente
│   │   └── index.js        # Frontend-Entry-Point
│   ├── webpack.config.js   # Frontend Webpack-Konfiguration
│   └── public/             # Statische Dateien
└── dist/                   # Backend-Build-Output
```

## 🔧 Konfiguration

### Umgebungsvariablen
Erstellen Sie eine `.env` Datei im Root-Verzeichnis:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=growhub
DB_USER=postgres
DB_PASSWORD=password

# API Configuration
API_TOKEN=your-secret-api-token-here
PORT=3000

# Environment
NODE_ENV=development
```

### Frontend-Konfiguration
Die Frontend-Konfiguration befindet sich in `frontend/webpack.config.js` und `frontend/src/`.

## 📊 API-Endpunkte

### Health Check
- `GET /api/health` - Server-Status

### Daten-Endpunkte
- `POST /api/data` - Neue Messwerte erstellen (Authentifizierung erforderlich)
- `GET /api/data/latest` - Neueste Messwerte aller Sensoren
- `GET /api/data/stats` - Allgemeine Statistiken
- `GET /api/data/stats/sensor` - Sensor-spezifische Statistiken
- `GET /api/data` - Alle Messwerte (mit Pagination)
- `GET /api/data/sensor/:sensorName` - Messwerte für spezifischen Sensor

## 🎨 Frontend-Features

- **Dashboard:** Live-Anzeige aktueller Sensorwerte
- **Statistiken:** Detaillierte Charts und Analysen
- **Responsive Design:** Optimiert für Desktop und Mobile
- **Dark Theme:** Moderne dunkle Benutzeroberfläche
- **Bootstrap 5:** Moderne UI-Komponenten
- **Chart.js:** Interaktive Datenvisualisierung

## 🗄️ Datenbank-Schema

### Tabellen
- `measurements` - Haupttabelle für Messungen
- `measurement_values` - Einzelne Sensorwerte pro Messung

### Sensoren
- Temperatur (°C)
- Luftfeuchtigkeit (%)
- Bodenfeuchtigkeit Pflanze 1-3 (%)
- Wasserstand (cm)

## 🛠️ Entwicklung

### Backend-Entwicklung
```bash
npm run dev:backend
```
- Server läuft auf Port 3000
- Automatischer Neustart bei Änderungen
- Webpack-Build für Backend-Code

### Frontend-Entwicklung
```bash
npm run dev:frontend
```
- Development-Server auf Port 3001
- Hot-Reload für React-Komponenten
- SCSS-Compilation

### Beide gleichzeitig
```bash
npm run dev
```
- Verwendet `concurrently` für parallele Ausführung
- Backend und Frontend starten simultan

## 🔍 Debugging

### Backend-Logs
```bash
# Logs in Echtzeit anzeigen
npm run dev:backend
```

### Frontend-Logs
```bash
# Browser-Entwicklertools öffnen
# Console-Logs anzeigen
```

### Datenbank-Verbindung testen
```bash
# PostgreSQL-Verbindung prüfen
pg_isready -h localhost -p 5432 -U postgres

# Datenbank verbinden
psql -U postgres -d growhub
```

## 🚀 Production Deployment

### Build für Production
```bash
npm run build
```

### Production-Server starten
```bash
NODE_ENV=production npm start
```

### Umgebungsvariablen für Production
```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PASSWORD=your-secure-password
API_TOKEN=your-secure-api-token
```

## 📦 Dependencies

### Backend-Dependencies
- Express.js - Web-Framework
- PostgreSQL - Datenbank
- Helmet - Security
- CORS - Cross-Origin Resource Sharing
- Rate Limiting - API-Schutz

### Frontend-Dependencies
- React 18 - UI-Framework
- React Router - Navigation
- Bootstrap 5 - UI-Komponenten
- Chart.js - Datenvisualisierung
- SCSS - Styling

### Development-Dependencies
- Webpack - Module Bundler
- Babel - JavaScript-Compiler
- Nodemon - Development-Server
- Concurrently - Parallele Scripts

## 🤝 Beitragen

1. Fork des Repositories
2. Feature-Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request erstellen

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## 📞 Support

Bei Problemen oder Fragen:
1. Issues im Repository erstellen
2. Dokumentation überprüfen
3. Logs analysieren
#   g r o w h u b  
 