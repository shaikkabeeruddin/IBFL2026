import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (username, password) =>
  api.post('/auth/login', { username, password });

export const verifyToken = () =>
  api.get('/auth/verify');

// Teams
export const getTeams = () =>
  api.get('/teams');

export const getTeam = (id) =>
  api.get(`/teams/${id}`);

export const createTeam = (name) =>
  api.post('/teams', { name });

export const updateTeam = (id, data) =>
  api.put(`/teams/${id}`, data);

export const deleteTeam = (id) =>
  api.delete(`/teams/${id}`);

export const uploadLogo = (id, formData) =>
  api.post(`/teams/${id}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Players
export const addPlayer = (teamId, data) =>
  api.post(`/teams/${teamId}/players`, data);

export const deletePlayer = (teamId, playerId) =>
  api.delete(`/teams/${teamId}/players/${playerId}`);

// Matches
export const getMatches = () =>
  api.get('/matches');

export const getMatch = (id) =>
  api.get(`/matches/${id}`);

export const createMatch = (data) =>
  api.post('/matches', data);

export const updateMatch = (id, data) =>
  api.put(`/matches/${id}`, data);

export const deleteMatch = (id) =>
  api.delete(`/matches/${id}`);

// Goalscorers
// Backend expects: { player_id, minute }
export const addGoalscorer = (matchId, data) =>
  api.post(`/matches/${matchId}/goalscorers`, data);

export const deleteGoalscorer = (id) =>
  api.delete(`/goalscorers/${id}`);

// Stats
export const getStats = () =>
  api.get('/stats');

export default api;
