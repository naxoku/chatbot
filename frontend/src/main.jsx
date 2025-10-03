import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import axios from "axios";
import { API_BASE } from "./config";

const DEFAULT_URL = API_BASE;

axios.defaults.withCredentials = true;
axios.defaults.baseURL = DEFAULT_URL;

axios.interceptors.response.use(
  (response) => {
    if (response.config.url === "/checkSession" && !response.data.logged_in) {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (error.code === "ERR_NETWORK" || !error.response) {
      console.error("Backend no accesible:", error.message);
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);