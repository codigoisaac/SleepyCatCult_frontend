import axios from "axios";
import Cookies from "js-cookie";

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token in every request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Movie service for API calls
export const movieService = {
  getAll: (page = 1, search = "", filters = {}) => {
    return api.get("/movies", {
      params: {
        page,
        search,
        ...filters,
      },
    });
  },
  getById: (id: string) => api.get(`/movies/${id}`),
  create: (data: FormData) => api.post("/movies", data),
  update: (id: string, data: FormData) => api.put(`/movies/${id}`, data),
  delete: (id: string) => api.delete(`/movies/${id}`),
};

export default api;
