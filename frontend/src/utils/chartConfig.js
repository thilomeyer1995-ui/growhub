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

// Adapter erst nach der Registrierung laden
setTimeout(() => {
  try {
    require('chartjs-adapter-date-fns');
  } catch (error) {
    console.warn('Chart.js date-fns adapter could not be loaded:', error);
  }
}, 0);

export default ChartJS;
