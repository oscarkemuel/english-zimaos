import { useCallback } from "react";

const useBackup = () => {
  const isDevelopment = import.meta.env.MODE !== "production";

  const sendStatsToGoogleSheet = (stats: {
    currentStreak: number;
    maxStreak: number;
    lastActivityDate?: string;
  }) => {
    if (isDevelopment) {
      return;
    }

    fetch(import.meta.env.VITE_SCRIPT_GOOGLE_APP, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(stats),
    });
  };

  const backupLocalStorage = () => {
    if (isDevelopment) {
      return;
    }

    const data: Record<string, string | null> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key) {
        data[key] = localStorage.getItem(key);
      }
    }

    fetch(`${isDevelopment && "http://localhost:8888"}/backup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  const loadBackupFromServer = useCallback(async () => {
    try {
      const response = await fetch(`${isDevelopment && "http://localhost:8888"}/backup`);

      if (!response.ok) {
        throw new Error("Erro ao buscar backup");
      }

      const data: Record<string, string | null> = await response.json();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== null) {
          localStorage.setItem(key, value);
        }
      });
    } catch (error) {
      console.error("Erro on load backup:", error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    backupLocalStorage,
    sendStatsToGoogleSheet,
    loadBackupFromServer,
  };
};

export default useBackup;