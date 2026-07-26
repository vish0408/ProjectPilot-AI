import { AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  userName: string;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({ open, userName, deleting, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-[95%] sm:w-full max-w-md border border-white/10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Confirm Delete</h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors touch-target">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col items-center text-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Delete User</p>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete <span className="font-bold text-slate-700 dark:text-slate-300">{userName}</span>?
                This action cannot be undone. All associated data will be permanently removed from the database.
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end">
            <button
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors touch-target"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 touch-target"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              {deleting ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
