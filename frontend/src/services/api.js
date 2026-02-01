import axios from 'axios';

// Support environment variable override or auto-detect based on current host
const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001/api`;

export async function processIncident(data) {
  console.log('[API] Sending:', data);
  const response = await axios.post(`${API_BASE}/incident`, data);
  console.log('[API] Response:', response.data);
  return response.data;
}
