import { Button } from "@/components/ui/button";
import type { YoutubeVideo } from "@/types/youtube";
import { CheckCircle2, Circle, Play } from "lucide-react";

interface VideoItemProps {
  video: YoutubeVideo;
  index: number;
  active: boolean;
  watched: boolean;
  onPlay: () => void;
  onToggleWatched: () => void;
}

export function VideoItem({
  video,
  index,
  active,
  watched,
  onPlay,
  onToggleWatched,
}: VideoItemProps) {
  return (
    <div
      onClick={onPlay}
      className={[
        "group flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all",
        active
          ? "border-zinc-700 bg-zinc-900"
          : "border-transparent hover:border-zinc-800 hover:bg-zinc-950",
      ].join(" ")}
    >
      <span className="w-6 text-center text-xs text-zinc-600 shrink-0">
        {index + 1}
      </span>

      <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-zinc-900 shrink-0">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
          <Play className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 fill-current transition-opacity" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "text-sm font-medium line-clamp-2",
            watched ? "text-zinc-500" : "text-zinc-200",
          ].join(" ")}
        >
          {video.title}
        </p>

        <p className="text-xs text-zinc-600 mt-1 truncate">
          {video.channelTitle}
        </p>
      </div>

      <Button
        size="icon"
        variant="ghost"
        onClick={(event) => {
          event.stopPropagation();

          onToggleWatched();
        }}
        className={
          watched
            ? "text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 shrink-0"
            : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 shrink-0"
        }
      >
        {watched ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}
