import axios from 'axios';

const API_URL = 'https://urban-zebra-q765gxqv55p424wpp-8000.app.github.dev/'; // Update for production

const api = axios.create({
  baseURL: API_URL,
});

export const login = async (username, password, role) => {
  const response = await axios.post(`${API_URL}/login`, {
    username,
    password,
    role, // now included
  });
  return response.data;
};

export const submitEvidence = async (token, formData) => {
  const response = await api.post('/submit', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const extractClaims = async (token, text) => {
  const response = await api.post('/claims/extract', `"${text}"`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const getStories = async (token, region, topic, level) => {
  const params = {};
  if (region) params.region = region;
  if (topic) params.topic = topic;
  if (level) params.level = level;
  const response = await api.get('/stories', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const getStoryProvenance = async (token, id) => {
  const response = await api.get(`/stories/${id}/provenance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const submitCorrection = async (token, id, correction) => {
  const response = await api.post(`/stories/${id}/correction`, correction, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
