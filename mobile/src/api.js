import axios from 'axios';

// Change this to your machine's LAN IP for real device testing
const API_URL = Platform.select({
  android: 'http://10.0.2.2:3000/api',
  default: 'http://localhost:3000/api'
});

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

export default api;
