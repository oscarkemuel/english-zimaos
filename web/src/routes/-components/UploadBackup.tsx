import { Button } from "@/components/ui/button";
import useBackup from "@/hooks/useBackup";
import { RefreshCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UploadBackup() {
  const { loadBackupFromServer } = useBackup();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Synchronize data"
          onClick={loadBackupFromServer}
        >
          <RefreshCcw className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">Synchronize Data</TooltipContent>
    </Tooltip>
  );
}
