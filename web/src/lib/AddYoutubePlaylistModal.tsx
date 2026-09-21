import {
  useEffect,
  useState,
} from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Loader2,
  MonitorPlay,
} from "lucide-react";

import type { YoutubePlaylist } from "@/types/youtube";

interface Props {
  open: boolean;

  onOpenChange: (
    open: boolean,
  ) => void;

  onAdd: (
    value: string,
  ) => Promise<YoutubePlaylist>;
}

const AddYoutubePlaylistModal = ({
  open,
  onOpenChange,
  onAdd,
}: Props) => {
  const [playlistId, setPlaylistId] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!open) {
      setPlaylistId("");
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!playlistId.trim()) {
      setError(
        "Enter a YouTube playlist ID or URL.",
      );

      return;
    }

    try {
      setLoading(true);
      setError(null);

      await onAdd(playlistId);

      onOpenChange(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to add playlist.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="dark border-zinc-800 bg-zinc-950 text-zinc-50 sm:max-w-md">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-2">
              <MonitorPlay className="w-6 h-6 text-zinc-400" />
            </div>

            <DialogTitle>
              Add YouTube Playlist
            </DialogTitle>

            <DialogDescription className="text-zinc-400">
              Paste the playlist URL or
              enter its YouTube playlist
              ID.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Input
              value={playlistId}
              onChange={(event) =>
                setPlaylistId(
                  event.target.value,
                )
              }
              placeholder="PLxxxxxxxxxxxxxxxx"
              disabled={loading}
              autoFocus
              className="border-zinc-800 bg-zinc-900/60 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
            />

            <p className="text-xs text-zinc-500">
              You can also paste a full
              youtube.com playlist URL.
            </p>

            {error && (
              <p className="text-sm text-red-400">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              onClick={() =>
                onOpenChange(false)
              }
              className="text-zinc-400 hover:text-zinc-50"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-zinc-100 text-zinc-400 hover:text-zinc-50 hover:bg-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading
                </>
              ) : (
                "Add Playlist"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddYoutubePlaylistModal;