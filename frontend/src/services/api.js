import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export async function processIncident(data) {
  console.log('[API] Sending:', data);
  const response = await axios.post(`${API_BASE}/incident`, data);
  console.log('[API] Response:', response.data);
  return response.data;
}
