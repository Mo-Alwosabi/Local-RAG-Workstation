"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const ACTIVE_COLLECTION_KEY = "rag-active-collection";
const THEME_KEY = "al-haj-theme";

export type ThemeMode = "light" | "dark";

interface AppContextValue {
  activeCollectionId: string | null;
  setActiveCollectionId: (id: string | null) => void;
  refreshKey: number;
  refresh: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeCollectionId, setActiveCollectionIdState] = useState<
    string | null
  >(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setActiveCollectionIdState(localStorage.getItem(ACTIVE_COLLECTION_KEY));

    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    const initialTheme: ThemeMode = savedTheme === "light" ? "light" : "dark";
    setThemeState(initialTheme);

    // Apply class to html
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setHydrated(true);
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const setActiveCollectionId = useCallback((id: string | null) => {
    setActiveCollectionIdState(id);
    if (id) localStorage.setItem(ACTIVE_COLLECTION_KEY, id);
    else localStorage.removeItem(ACTIVE_COLLECTION_KEY);
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  const value = useMemo(
    () => ({
      activeCollectionId: hydrated ? activeCollectionId : null,
      setActiveCollectionId,
      refreshKey,
      refresh,
      theme,
      toggleTheme,
      setTheme,
    }),
    [
      activeCollectionId,
      hydrated,
      refresh,
      refreshKey,
      setActiveCollectionId,
      theme,
      toggleTheme,
      setTheme,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
