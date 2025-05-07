import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { MovieForm } from "@/types/movie";

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
  },
);

// Interceptor de resposta para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Verifica se é um erro 401 (Unauthorized) E se existe um token
    if (error.response?.status === 401 && Cookies.get("token")) {
      // Remove o token
      Cookies.remove("token");
      delete api.defaults.headers.common["Authorization"];

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
  },
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

const errorMessageSuffix =
  "Please check the data you are sending and if the error persists, send us a message at meow@sleepycat.cult";

function showErrorMessage(errorPrefix: string) {
  toast.error(`${errorPrefix}. ${errorMessageSuffix}`);
}

export const authService = {
  register: async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => api.post("/auth/register", { name, email, password }),

  login: async ({ email, password }: { email: string; password: string }) =>
    api
      .post("/auth/login", { email, password })
      .then((response) => {
        toast.success("You're in the Cult! Enjoy! 🐈");
        return response;
      })
      .catch((error) => {
        showErrorMessage("Error letting you in the Cult.");
        return Promise.reject(error);
      }),
};

//! alternate to receive objects
export const movieService = {
  //! include toast messages
  getAll: async (filters: MovieFilters = {}) => {
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
      Object.entries(mappedFilters).filter(([_, v]) => v !== undefined),
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
              totalPages: Math.ceil(response.data.length / 12), //! must come from API
            },
          };
        }
        return response;
      });
  },
  getById: async (id: string | number) => api.get(`/movies/${id}`),
  create: (data: MovieForm) =>
    api
      .post("/movies", data)
      .then((response) => {
        toast.success("Movie created. Thank you!");
        return response;
      })
      .catch((error) => {
        showErrorMessage("Error creating the movie.");
        return Promise.reject(error);
      }),
  update: async (id: string | number, data: MovieForm) =>
    api
      .patch(`/movies/${id}`, data)
      .then((response) => {
        toast.success("Movie updated with success!");
        return response;
      })
      .catch((error) => {
        showErrorMessage("Error updating the movie.");
        return Promise.reject(error);
      }),
  delete: async (id: string | number) => api.delete(`/movies/${id}`),
};

export default api;
