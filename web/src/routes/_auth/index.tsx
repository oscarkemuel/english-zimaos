import { createFileRoute } from "@tanstack/react-router";
import StreakCalendar from "../-components/StreakCalendar";
import StreakStatsCard from "../-components/StreakStatsCard";
import ContinueLearningCard from "../-components/ContinueLearningCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PlaylistButton from "../-components/PlaylistButton";
import useBackup from "@/hooks/useBackup";
import { useEffect, useState } from "react";
import YoutubeButton from "../-components/YoutubeButton";
import { useAuthContext } from "@/contexts/auth";
import LogoutButton from "../-components/LogoutButton";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_auth/")({
  component: Index,
});

function Index() {
  const { user } = useAuthContext()
  const { loadBackupFromServer } = useBackup();
  const [isLoadingBackup, setIsLoadingBackup] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function handleBackup() {
      try {
        await loadBackupFromServer();
      } finally {
        if (isMounted) {
          setIsLoadingBackup(false);
        }
      }
    }

    void handleBackup();

    return () => {
      isMounted = false;
    };
  }, [loadBackupFromServer]);

  if (isLoadingBackup) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 w-full">
        <Skeleton className="w-full h-36.5" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="w-full h-61.5" />
        <Skeleton className="w-full h-61.5" />
      </div>

      <div className="w-full">
        <Skeleton className="w-full h-65.5" />
      </div>
    </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 w-full">
      <div className="flex justify-between bg-linear-to-r from-zinc-950 to-zinc-900/50 p-6 rounded-2xl border border-zinc-800 shadow-sm sm:flex-row flex-col gap-6 sm:gap-0 items-center sm:items-start">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 ">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-zinc-900 shadow-lg">
            <AvatarImage
              src={user!.profile}
              alt={user!.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-zinc-800 text-zinc-300 text-2xl font-bold">
              {user!.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col text-center sm:text-left justify-center pt-1 sm:pt-3">
            <p className="text-2xl sm:text-3xl font-bold text-zinc-50 tracking-tight flex items-center justify-center sm:justify-start gap-2">
              Welcome back, {user!.name}! <span>👋</span>
            </p>
            <p className="text-zinc-400 text-sm sm:text-base mt-2">
              Listen to your Audio playlists and keep track of your progress.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <YoutubeButton />

          <PlaylistButton />

          <LogoutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StreakStatsCard />
        <ContinueLearningCard />
      </div>

      <div className="w-full">
        <StreakCalendar />
      </div>
    </div>
  );
}
