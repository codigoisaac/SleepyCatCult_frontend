import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

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

interface MovieFilters {
  durationMin?: number | null;
  durationMax?: number | null;
  releaseDateMin?: string;
  releaseDateMax?: string;
  search?: string;
  scoreMin?: number | null;
  scoreMax?: number | null;
  paginationPage?: number;
  paginationPerPage?: number;
}

export const movieService = {
  getAll: (filters: MovieFilters = {}) => {
    const mappedFilters = {
      durationMin: filters.durationMin || undefined,
      durationMax: filters.durationMax || undefined,
      releaseDateMin: filters.releaseDateMin || undefined,
      releaseDateMax: filters.releaseDateMax || undefined,
      search: filters.search || undefined,
      scoreMin: filters.scoreMin || undefined,
      scoreMax: filters.scoreMax || undefined,
      paginationPage: filters.paginationPage || undefined,
      paginationPerPage: filters.paginationPerPage || undefined,
    };

    const cleanedParams = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(mappedFilters).filter(([_, v]) => v !== undefined)
    );

    return api
      .get("/movies", {
        params: cleanedParams,
      })
      .then((response) => {
        // If the API returns an array directly, wrap it to match expected format
        if (Array.isArray(response.data)) {
          return {
            ...response,
            data: {
              movies: response.data,
              totalPages: Math.ceil(response.data.length / 10), // Assuming 10 per page
            },
          };
        }
        return response;
      });
  },
  getById: (id: string | number) => api.get(`/movies/${id}`),
  create: (data: FormData) => api.post("/movies", data),
  update: (id: string | number, data: FormData) =>
    api.put(`/movies/${id}`, data),
  delete: (id: string | number) => api.delete(`/movies/${id}`),
};

export default api;
