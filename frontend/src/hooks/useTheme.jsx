import { useState, useEffect } from "react";

const useTheme = () => {
  const [isDarkMode, setIsDarkModeState] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("darkMode");
      if (stored !== null) {
        return stored === "enabled";
      }
      // Si no hay valor guardado, usar la preferencia del sistema
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Efecto para aplicar la clase dark al documento
  useEffect(() => {
    const htmlElement = document.documentElement;

    if (isDarkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }

    // Guardar en localStorage
    localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
  }, [isDarkMode]);

  // Escuchar cambios en la preferencia del sistema (opcional)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      // Solo aplicar si no hay preferencia guardada
      const stored = localStorage.getItem("darkMode");
      if (!stored) {
        setIsDarkModeState(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDarkModeState((prev) => !prev);
  };

  return {
    isDarkMode,
    toggleDarkMode,
  };
};

export default useTheme;
