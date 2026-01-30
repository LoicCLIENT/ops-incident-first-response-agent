import axios from 'axios';

const API_BASE = '/api';

export async function processIncident(data) {
  const response = await axios.post(`${API_BASE}/incident`, data);
  return response.data;
}
