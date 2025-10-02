import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // withCredentials: true, // only needed if backend uses cookies
});

// ✅ Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
