const useBackup = () => {
  const sendStatsToGoogleSheet = (stats: {
    currentStreak: number;
    maxStreak: number;
    lastActivityDate?: string;
  }) => {
    if (import.meta.env.MODE !== "production") {
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
    if (import.meta.env.MODE !== "production") {
      return;
    }

    const data: Record<string, string | null> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key);
      }
    }

    fetch(`/backup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  const loadBackupFromServer = async () => {
    try {
      const response = await fetch("/backup");

      if (!response.ok) {
        throw new Error("Erro ao buscar backup");
      }

      const data: Record<string, string | null> = await response.json();

      localStorage.clear();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== null) {
          localStorage.setItem(key, value);
        }
      });

      window.location.reload();
    } catch (error) {
      console.error("Erro on load backup:", error);
    }
  };

  return {
    backupLocalStorage,
    sendStatsToGoogleSheet,
    loadBackupFromServer,
  };
};

export default useBackup;
