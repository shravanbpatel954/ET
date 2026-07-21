import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const threatAPI = {
  analyzeContent: async (formData) => {
    const response = await api.post('/analyze/full', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/analyze/stats');
    return response.data;
  },
  getGraph: async () => {
    const response = await api.get('/analyze/graph');
    return response.data;
  },
  getGeoHotspots: async () => {
    const response = await api.get('/geo/hotspots');
    return response.data;
  },
  getGeoSummary: async () => {
    const response = await api.get('/geo/summary');
    return response.data;
  },
  getScamIntel: async () => {
    const response = await api.get('/analyze/scam-intel');
    return response.data;
  },
  getLawEnforcement: async () => {
    const response = await api.get('/analyze/law-enforcement');
    return response.data;
  },
  getSystemStatus: async () => {
    const response = await api.get('/analyze/system-status');
    return response.data;
  },
  getMarketSources: async () => {
    const response = await api.get('/analyze/market/sources');
    return response.data;
  },
  syncMarket: async (payload = { limit: 10 }) => {
    const response = await api.post('/analyze/market/sync', payload);
    return response.data;
  },
  getCurrencyStatus: async () => {
    const response = await api.get('/currency/status');
    return response.data;
  },
  analyzeCurrencyNote: async (formData) => {
    const response = await api.post('/currency/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  getAudioStatus: async () => {
    const response = await api.get('/audio/status');
    return response.data;
  },
  analyzeAudio: async (formData) => {
    const response = await api.post('/audio/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
