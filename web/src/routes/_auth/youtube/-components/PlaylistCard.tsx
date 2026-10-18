import { Button } from "@/components/ui/button";
import type { YoutubePlaylist } from "@/types/youtube";
import { Loader2, MonitorPlay, Play, RefreshCw, Trash2 } from "lucide-react";

interface PlaylistCardProps {
  playlist: YoutubePlaylist;
  selected: boolean;
  watchedCount: number;
  progress: number;
  refreshing: boolean;
  onOpen: () => void;
  onRefresh: () => void;
  onDelete: () => void;
}

export function PlaylistCard({
  playlist,
  selected,
  watchedCount,
  progress,
  refreshing,
  onOpen,
  onRefresh,
  onDelete,
}: PlaylistCardProps) {
  return (
    <div
      onClick={onOpen}
      className={[
        "overflow-hidden rounded-xl border bg-zinc-950/50 cursor-pointer transition-all",
        selected
          ? "border-zinc-600 bg-zinc-900/60"
          : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/30",
      ].join(" ")}
    >
      <div className="aspect-video bg-zinc-900 overflow-hidden relative">
        {playlist.thumbnail ? (
          <img
            src={playlist.thumbnail}
            alt={playlist.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MonitorPlay className="w-10 h-10 text-zinc-700" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />

        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/80 backdrop-blur text-xs text-zinc-200">
          {playlist.videos.length} videos
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-medium text-zinc-100 line-clamp-1">
            {playlist.title}
          </h3>

          <p className="text-sm text-zinc-500 line-clamp-1 mt-1">
            {playlist.channelTitle}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">
              {watchedCount}/{playlist.videos.length} watched
            </span>

            <span className="text-zinc-400">{progress}%</span>
          </div>

          <div className="h-1.5 rounded-full overflow-hidden bg-zinc-800">
            <div
              className="h-full bg-zinc-400 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center text-sm text-zinc-400">
            <Play className="w-4 h-4 mr-1.5 fill-current" />
            Open
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              disabled={refreshing}
              onClick={(event) => {
                event.stopPropagation();

                onRefresh();
              }}
              className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation();

                onDelete();
              }}
              className="text-zinc-500 hover:text-red-400 hover:bg-red-950/30"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}