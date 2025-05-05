"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";
import api, { setLogoutFunction } from "@/lib/api";
import Cookies from "js-cookie";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    console.log("AuthContext - Logging out");
    Cookies.remove("token");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    router.push("/login");
  }, [router]);

  // Registra a função de logout para o interceptor do axios
  useEffect(() => {
    setLogoutFunction(() => {
      console.log("Logout chamado pelo interceptor (token expirado)");
      logout();
    });
  }, [router, logout]);

  // Initialize auth state from token
  useEffect(() => {
    console.log("AuthContext - Initializing auth state");

    const initAuth = async () => {
      try {
        const token = Cookies.get("token");
        console.log("AuthContext - Token exists:", !!token);

        if (token) {
          try {
            console.log("AuthContext - Decoding token");
            const decoded = jwtDecode<{ user: User }>(token);
            console.log("AuthContext - Token decoded successfully");

            setUser(decoded.user);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            console.log("AuthContext - User set from token:", decoded.user);
          } catch (error) {
            console.error("AuthContext - Token validation failed:", error);
            Cookies.remove("token");
            delete api.defaults.headers.common["Authorization"];
            setUser(null);
            router.push("/login");
          }
        } else {
          console.log("AuthContext - No token found");
          setUser(null);
        }
      } finally {
        console.log("AuthContext - Auth initialization complete");
        setLoading(false);
      }
    };

    initAuth();
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      console.log("AuthContext - Attempting login");
      setLoading(true);

      const response = await api.post("/auth/login", { email, password });
      const token = response.data.accessToken;
      console.log("AuthContext - Login successful, token received");

      Cookies.set("token", token, {
        expires: 7,
        path: "/",
        sameSite: "strict",
      });
      console.log("AuthContext - Token saved to cookies");

      const decoded = jwtDecode<{ user: User }>(token);
      setUser(decoded.user);
      console.log("AuthContext - User set from login:", decoded.user);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      toast.success("Você está logado. Bem-vindo!");

      console.log("AuthContext - Redirecting to movies after login");
      router.push("/movies");
    } catch (error) {
      console.error("AuthContext - Login failed:", error);
      toast.error("Credenciais inválidas");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log("AuthContext - Attempting registration");
      setLoading(true);

      await api.post("/auth/register", { name, email, password });
      console.log("AuthContext - Registration successful");

      toast.success("Cadastro realizado com sucesso! Faça login.");
      router.push("/login");
    } catch (error) {
      console.error("AuthContext - Registration failed:", error);
      toast.error("Falha ao registrar");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const authValue = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  console.log("AuthContext - Current state:", {
    isAuthenticated: !!user,
    loading,
    userExists: !!user,
  });

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
