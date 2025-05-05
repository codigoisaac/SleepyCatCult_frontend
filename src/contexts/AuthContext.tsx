"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<{ user: User }>(token);
        setUser(decoded.user);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.error("Token validation failed:", error);
        localStorage.removeItem("token");
        // Optionally show a toast notification
        toast.error("Session expired. Please log in again.");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/auth/login", { email, password });
      const { token } = response.data;
      localStorage.setItem("token", token);

      const decoded = jwtDecode<{ user: User }>(token);
      setUser(decoded.user);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      toast.success("Login successful!");
      router.push("/movies");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Invalid credentials");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      await axios.post("/api/auth/register", { name, email, password });
      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    router.push("/login");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
