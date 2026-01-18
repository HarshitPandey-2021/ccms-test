// src/context/AuthContext.jsx - LANDING PAGE (FIXED)
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (data) => {
    setUser(data);
    
    if (data?.user?.role === "admin" && data?.token) {
      console.log("🔑 AuthContext: Saving admin session to localStorage");
      
      const cleanUser = {
        name: data.user.name || data.user.email?.split("@")[0] || "Admin",
        email: data.user.email,
        role: data.user.role,
        userId: data.user._id || data.user.id,
      };

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("ccms-admin-token", data.token);
      localStorage.setItem("ccms-admin-session", JSON.stringify(cleanUser));
      localStorage.setItem("adminUser", JSON.stringify(cleanUser));
      localStorage.setItem("adminProfile", JSON.stringify(cleanUser));
      localStorage.setItem("user", JSON.stringify(cleanUser));
      
      if (data.refreshToken) {
        localStorage.setItem("adminRefreshToken", data.refreshToken);
      }
      
      console.log("✅ Admin session saved");
    }
  };

  const logout = () => {
    setUser(null);
    
    // ✅ Clear ALL possible storage keys
    const keysToRemove = [
      "adminToken",
      "ccms-admin-token",
      "token",
      "authToken",
      "ccms-admin-session",
      "adminUser",
      "adminProfile",
      "user",
      "profile",
      "adminRefreshToken",
      "refreshToken",
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    sessionStorage.clear();
    
    console.log("🚪 AuthContext: Session cleared");
    
    // ✅ Use replace to prevent back navigation
    window.location.replace("/login");
  };

  const signup = (data) => {
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}