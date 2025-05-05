import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

// Vamos criar uma função para lidar com o logout que será usada pelo interceptor
let logoutFunction: (() => void) | null = null;

export const setLogoutFunction = (fn: () => void) => {
  logoutFunction = fn;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de requisição para adicionar o token
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

// Interceptor de resposta para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Verifica se é um erro 401 (Unauthorized)
    if (error.response?.status === 401) {
      // Remove o token
      Cookies.remove("token");
      delete api.defaults.headers.common["Authorization"];

      // Mostra um toast de sessão expirada que permanece até o usuário fechar
      toast.error("Sua sessão expirou. Por favor, faça login novamente.", {
        duration: 7000,
        id: "session-expired", // ID único para evitar toasts duplicados
      });

      // Executa a função de logout se estiver definida
      if (logoutFunction) {
        logoutFunction();
      }
    }
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
