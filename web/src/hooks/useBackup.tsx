import { useCallback } from "react";
import { LOCAL_STORAGE_KEYS } from "@/utils/constants";
import type { IBackupResponse } from "@/types/backup";
import { useAuthContext } from "@/contexts/auth";

const useBackup = () => {
  const { USER: userKey } = LOCAL_STORAGE_KEYS;
  const { user } = useAuthContext();
  const isDevelopment = import.meta.env.MODE !== "production";
  const backupEndpoint = isDevelopment ? `http://localhost:8888/backup/${user!.id}` : `/backup/${user!.id}`;

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
    const data: Record<string, string | null> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key) {
        data[key] = localStorage.getItem(key);
      }
    }

    fetch(backupEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  const loadBackupFromServer = useCallback(async () => {
    try {
      const response = await fetch(backupEndpoint);

      if (!response.ok) {
        throw new Error("Erro ao buscar backup");
      }

      const data: IBackupResponse = await response.json();

      if (Object.keys(data.backup).length === 0) {
        localStorage.clear();
        return;
      }
      Object.entries(data.backup).forEach(([key, value]) => {
        if (value !== null) {
          localStorage.setItem(key, value);
        }
      });

      localStorage.setItem(userKey, JSON.stringify(data.user));
      window.dispatchEvent(new Event("backup-loaded"));
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