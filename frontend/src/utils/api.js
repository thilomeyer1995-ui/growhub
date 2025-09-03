// API-Konfiguration für direkte Kommunikation mit Backend
const API_BASE_URL = '';

// Zentrale API-Funktionen
export const api = {
  // GET-Request
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // POST-Request
  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // PUT-Request
  put: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // DELETE-Request
  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

// Spezifische API-Endpunkte
export const apiEndpoints = {
  health: () => api.get('/api/health'),
  latestData: () => api.get('/api/data/latest'),
  dataStats: () => api.get('/api/data/stats'),
  sensorData: (sensorName, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/data/sensor/${sensorName}${queryString ? `?${queryString}` : ''}`;
    return api.get(url);
  },
  allData: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/data${queryString ? `?${queryString}` : ''}`;
    return api.get(url);
  },
  createData: (data) => api.post('/api/data', data),
};

export default api;
