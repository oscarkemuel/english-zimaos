import { LOCAL_STORAGE_KEYS } from "@/utils/constants";
import useLocalStorage from "./useLocalStorage";
import useBackup from "./useBackup";

interface AudioClip {
  title: string;
  url: string;
}

const usePlaylist = () => {
  const { AUDIO_PLAYLIST } = LOCAL_STORAGE_KEYS;
  const [playlist, setPlaylist] = useLocalStorage(AUDIO_PLAYLIST, []);
  const { backupLocalStorage } = useBackup()

  const typedPlaylist = playlist as AudioClip[];

  const addToPlaylist = (clip: AudioClip) => {
    const updatedPlaylist = [...typedPlaylist, clip];
    setPlaylist(updatedPlaylist);
    backupLocalStorage();
  };

  const removeFromPlaylist = (url: string) => {
    const updatedPlaylist = typedPlaylist.filter((clip) => clip.url !== url);
    setPlaylist(updatedPlaylist);
    backupLocalStorage();
  };

  const hasAudioInPlaylist = (url: string) => {
    return typedPlaylist.some((clip) => clip.url === url);
  };

  const clearPlaylist = () => {
    setPlaylist([]);
    backupLocalStorage();
  };

  return {
    playlist: typedPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    hasAudioInPlaylist,
    clearPlaylist,
  };
};

export default usePlaylist;
