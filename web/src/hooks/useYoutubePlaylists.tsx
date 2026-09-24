import { LOCAL_STORAGE_KEYS } from "@/utils/constants";

import useLocalStorage from "./useLocalStorage";

import {
  fetchYoutubePlaylist,
  extractYoutubePlaylistId,
} from "@/services/youtube";

import type { YoutubePlaylist, YoutubeWatchedVideos } from "@/types/youtube";
import useBackup from "./useBackup";
import useActivity from "./useActivity";

const useYoutubePlaylists = () => {
  const { backupLocalStorage } = useBackup();
  const { saveActivity } = useActivity();

  const { YOUTUBE_PLAYLISTS, YOUTUBE_WATCHED_VIDEOS } = LOCAL_STORAGE_KEYS;

  const [storedPlaylists, setStoredPlaylists] = useLocalStorage(
    YOUTUBE_PLAYLISTS,
    [],
  );

  const [storedWatched, setStoredWatched] = useLocalStorage(
    YOUTUBE_WATCHED_VIDEOS,
    {},
  );

  const playlists = storedPlaylists as YoutubePlaylist[];

  const watched = storedWatched as YoutubeWatchedVideos;

  const addPlaylist = async (value: string) => {
    const playlistId = extractYoutubePlaylistId(value);

    const alreadyExists = playlists.some(
      (playlist) => playlist.id === playlistId,
    );

    if (alreadyExists) {
      throw new Error("This playlist has already been added.");
    }

    const playlist = await fetchYoutubePlaylist(value);

    setStoredPlaylists([...playlists, playlist]);

    backupLocalStorage();
    return playlist;
  };

  const refreshPlaylist = async (playlistId: string) => {
    const refreshedPlaylist = await fetchYoutubePlaylist(playlistId);

    setStoredPlaylists(
      playlists.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...refreshedPlaylist,
              addedAt: playlist.addedAt,
            }
          : playlist,
      ),
    );

    backupLocalStorage();
    return refreshedPlaylist;
  };

  const removePlaylist = (playlistId: string) => {
    setStoredPlaylists(
      playlists.filter((playlist) => playlist.id !== playlistId),
    );

    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [playlistId]: _removed,
      ...remainingWatched
    } = watched;

    setStoredWatched(remainingWatched);
    backupLocalStorage();
  };

  const isVideoWatched = (playlistId: string, videoId: string) => {
    return watched[playlistId]?.includes(videoId) ?? false;
  };

  const toggleVideoWatched = (playlistId: string, videoId: string) => {
    const playlistWatched = watched[playlistId] ?? [];

    const isAlreadyWatched = playlistWatched.includes(videoId);

    const updatedWatched = isAlreadyWatched
      ? playlistWatched.filter((id) => id !== videoId)
      : [...playlistWatched, videoId];

    saveActivity("youtube_video");
    setStoredWatched({
      ...watched,

      [playlistId]: updatedWatched,
    });

    backupLocalStorage();
  };

  const getWatchedCount = (playlistId: string) => {
    return watched[playlistId]?.length ?? 0;
  };

  const getProgress = (playlist: YoutubePlaylist) => {
    if (!playlist.videos.length) {
      return 0;
    }

    const watchedCount = getWatchedCount(playlist.id);

    return Math.round((watchedCount / playlist.videos.length) * 100);
  };

  return {
    playlists,
    watched,
    addPlaylist,
    refreshPlaylist,
    removePlaylist,
    isVideoWatched,
    toggleVideoWatched,
    getWatchedCount,
    getProgress,
  };
};

export default useYoutubePlaylists;
