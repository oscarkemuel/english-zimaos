import { Button } from "@/components/ui/button";
import { MonitorPlay } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "@tanstack/react-router";

export default function YoutubeButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: "/youtube" });
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Youtube Playlist"
            onClick={handleClick}
          >
            <MonitorPlay className="h-5 w-5" color="#fff" />
          </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Youtube Playlist</TooltipContent>
    </Tooltip>
  );
}
