"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  username: string;
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Also store username separately for easy access
      localStorage.setItem("username", parsedUser.username);
    }
    setIsLoading(false);
  }, []);

  // Login function - with the backend, login and register are the same operation
  // The backend will auto-register if the username doesn't exist
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Store credentials for socket connection
      const user = { id: password, username };
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("username", username);
      setUser(user);
      router.push("/chat");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function - same as login with this backend
  const register = async (username: string, password: string) => {
    return login(username, password);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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
