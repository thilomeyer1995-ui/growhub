import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js';

// Chart.js Registrierung
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

// Adapter manuell registrieren ohne Import
const registerDateAdapter = () => {
  if (typeof window !== 'undefined' && window.Chart) {
    try {
      // Dynamisch laden
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js';
      script.onload = () => {
        console.log('Chart.js date-fns adapter loaded from CDN');
      };
      script.onerror = () => {
        console.warn('Failed to load date-fns adapter from CDN');
      };
      document.head.appendChild(script);
    } catch (error) {
      console.warn('Could not load date-fns adapter:', error);
    }
  }
};

// Adapter registrieren
registerDateAdapter();

export default ChartJS;
