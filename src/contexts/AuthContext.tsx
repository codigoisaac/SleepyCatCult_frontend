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
import api, { setLogoutFunction, authService } from "@/lib/api";
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
    const initAuth = async () => {
      try {
        const token = Cookies.get("token");

        if (token) {
          try {
            const decoded = jwtDecode<{ user: User }>(token);

            setUser(decoded.user);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          } catch (error) {
            console.error("AuthContext - Token validation failed:", error);
            Cookies.remove("token");
            delete api.defaults.headers.common["Authorization"];
            setUser(null);
            router.push("/login");
          }
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const response = await authService.login({ email, password });
      const token = response.data.accessToken;

      Cookies.set("token", token, {
        expires: 7,
        path: "/",
        sameSite: "strict",
      });

      const decoded = jwtDecode<{ user: User }>(token);
      setUser(decoded.user);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      router.push("/movies");
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);

      await api.post("/auth/register", { name, email, password });

      router.push("/login");
    } catch (error) {
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
