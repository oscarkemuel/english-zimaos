import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthContext } from "@/contexts/auth";
import { useNavigate } from "@tanstack/react-router";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { useState } from "react";

export default function LogoutButton() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    logout()
    navigate({ to: '/profiles' })
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="logout"
              onClick={() => setOpen(true)}
            >
              <LogOut className="h-5 w-5" color="#fff" />
            </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Exit</TooltipContent>
      </Tooltip>

      <LogoutConfirmModal onConfirm={handleConfirm} open={open} onClose={() => setOpen(false)}/>
    </>
  );
}
