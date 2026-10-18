import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";

interface LogoutConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutConfirmModal = ({
  open,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) => {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-50 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <LogOut className="w-5 h-5 text-red-500" />
            Sign out of account
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400 text-base mt-2">
            Are you sure you want to end your session? You will need to log in again to access your data.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel
            onClick={onClose}
            className="bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Leave
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutConfirmModal;