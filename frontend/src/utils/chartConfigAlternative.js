// Alternative Chart.js-Konfiguration für date-fns Adapter Problem
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

// Alternative: Adapter dynamisch laden
const loadDateAdapter = async () => {
  try {
    // Warten bis Chart.js vollständig geladen ist
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Adapter importieren
    const adapter = await import('chartjs-adapter-date-fns');
    
    // Manuell registrieren falls nötig
    if (adapter && ChartJS.adapters) {
      ChartJS.adapters._date = adapter;
    }
  } catch (error) {
    console.warn('Failed to load chartjs-adapter-date-fns:', error);
  }
};

// Adapter laden
loadDateAdapter();

export default ChartJS;
