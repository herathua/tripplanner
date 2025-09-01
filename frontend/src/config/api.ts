import axios from 'axios';

// API Configuration
export const API_CONFIG = {
  // Use backend URL with /api context path
  BASE_URL: 'http://localhost:8080/api',
  TIMEOUT: 10000,
};

// External API Configuration
export const EXTERNAL_APIS = {
  WIKIPEDIA: {
    BASE_URL: 'https://en.wikipedia.org',
    TIMEOUT: 10000,
  },
  OPENMETEO: {
    BASE_URL: 'https://api.open-meteo.com/v1',
    GEOCODING_BASE_URL: 'https://geocoding-api.open-meteo.com/v1',
    TIMEOUT: 10000,
  },
  OPENTRIPMAP: {
    BASE_URL: 'https://api.opentripmap.com/0.1/en/places',
    API_KEY: import.meta.env.VITE_OPENTRIPMAP_API_KEY || '5ae2e3f221c38a28845f05b65272d9762fb9ce98b5f20a9a88276ba6',
    TIMEOUT: 10000,
  },
  OPENROUTER: {
    BASE_URL: 'https://openrouter.ai/api/v1',
    API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY || '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',
    TIMEOUT: 30000,
  },
};

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

// Create external API clients
export const wikipediaClient = axios.create({
  baseURL: EXTERNAL_APIS.WIKIPEDIA.BASE_URL,
  timeout: EXTERNAL_APIS.WIKIPEDIA.TIMEOUT,
});

export const openMeteoClient = axios.create({
  baseURL: EXTERNAL_APIS.OPENMETEO.BASE_URL,
  timeout: EXTERNAL_APIS.OPENMETEO.TIMEOUT,
});

export const openMeteoGeocodingClient = axios.create({
  baseURL: EXTERNAL_APIS.OPENMETEO.GEOCODING_BASE_URL,
  timeout: EXTERNAL_APIS.OPENMETEO.TIMEOUT,
});

export const openTripMapClient = axios.create({
  baseURL: EXTERNAL_APIS.OPENTRIPMAP.BASE_URL,
  timeout: EXTERNAL_APIS.OPENTRIPMAP.TIMEOUT,
});

export const openRouterClient = axios.create({
  baseURL: EXTERNAL_APIS.OPENROUTER.BASE_URL,
  timeout: EXTERNAL_APIS.OPENROUTER.TIMEOUT,
  headers: {
    'Authorization': `Bearer ${EXTERNAL_APIS.OPENROUTER.API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging (development only)
if (import.meta.env.DEV) {
  apiClient.interceptors.request.use(
    (config) => {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
      return config;
    },
    (error) => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for logging (development only)
  apiClient.interceptors.response.use(
    (response) => {
      console.log('API Response:', response.status, response.config.url);
      return response;
    },
    (error) => {
      console.error('API Response Error:', error.response?.status, error.config?.url);
      return Promise.reject(error);
    }
  );
}

// Temporarily disable Firebase authentication for testing
// apiClient.interceptors.request.use(async (config) => {
//   const user = auth.currentUser;
//   if (user) {
//     const token = await user.getIdToken();
//     config.headers = {
//       ...config.headers,
//       Authorization: `Bearer ${token}`,
//     };
//   }
//   return config;
// }, (error) => Promise.reject(error));

export default apiClient;
