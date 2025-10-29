import { createContext } from "react";

export const AuthContext = createContext({
  user: null,
  isAuthenticated: null,
  isLoading: true,
  logout: () => {},
  checkSession: () => {},
});