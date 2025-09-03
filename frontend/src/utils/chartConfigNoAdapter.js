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

// Custom Time Scale ohne date-fns Adapter
ChartJS.defaults.scales.time = {
  ...ChartJS.defaults.scales.time,
  time: {
    parser: function(value) {
      return new Date(value);
    },
    formatter: function(value) {
      return new Date(value).toLocaleDateString('de-DE');
    },
    unit: 'day',
    displayFormats: {
      day: 'dd.MM',
      hour: 'HH:mm',
      minute: 'HH:mm'
    }
  }
};

export default ChartJS;
