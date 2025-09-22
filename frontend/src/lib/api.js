import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: apiBaseUrl,
});

export function uploadCsv(file) {
  const form = new FormData();
  form.append('file', file);
  return api.post('/api/prices/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function listPrices(params) {
  return api.get('/api/prices', { params });
}

export function calculate(payload) {
  return api.post('/api/calculate', payload);
}

export function fetchRegions() {
  return api.get('/api/regions');
}

export function fetchCountries(region) {
  return api.get('/api/countries', { params: { region } });
}


