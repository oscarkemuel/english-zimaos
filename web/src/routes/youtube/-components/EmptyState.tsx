import { Button } from "@/components/ui/button";
import { MonitorPlay, Plus } from "lucide-react";

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/50">
      <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
        <MonitorPlay className="w-8 h-8 text-zinc-700" />
      </div>

      <p className="text-zinc-300 font-medium text-lg">
        Your playlist is empty
      </p>

      <p className="text-zinc-500 mt-1 max-w-sm">
        Add a YouTube playlist to start watching and tracking your progress.
      </p>

      <Button
        variant="outline"
        onClick={onAdd}
        className="mt-6 border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Playlist
      </Button>
    </div>
  );
}