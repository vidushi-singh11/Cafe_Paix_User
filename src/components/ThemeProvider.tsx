"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "morning" | "evening";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const updateTheme = () => {
      const hour = new Date().getHours();
      let detectedTheme: Theme = "light";

      if (hour >= 5 && hour < 11) detectedTheme = "morning";
      else if (hour >= 11 && hour < 16) detectedTheme = "light";
      else if (hour >= 16 && hour < 22) detectedTheme = "evening";
      else detectedTheme = "dark";

      setTheme(detectedTheme);
      document.documentElement.setAttribute("data-theme", detectedTheme);
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
