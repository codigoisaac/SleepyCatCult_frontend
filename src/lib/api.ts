import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Movie service
export const movieService = {
  getAll: (page = 1, search = "", filters = {}) =>
    api.get("/movies", { params: { page, search, ...filters } }),
  getById: (id: string) => api.get(`/movies/${id}`),
  create: (data: FormData) => api.post("/movies", data),
  update: (id: string, data: FormData) => api.put(`/movies/${id}`, data),
  delete: (id: string) => api.delete(`/movies/${id}`),
};

// Auth service
export const authService = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) =>
    api.post("/auth/register", { name, email, password, passwordConfirmation }),
};

export default api;
