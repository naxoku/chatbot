import React, { useState, useMemo, useCallback, useEffect } from "react";
import { CHECK_SESSION, LOGOUT } from "../../../config";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch(CHECK_SESSION, { credentials: "include" });
      const data = await response.json();
      
      setIsAuthenticated(data.logged_in);
      if (data.logged_in) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(LOGOUT, { method: "POST", credentials: "include" });
      setUser(null);
      setIsAuthenticated(false);
      localStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    logout,
    checkSession
  }), [user, isAuthenticated, isLoading, logout, checkSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};