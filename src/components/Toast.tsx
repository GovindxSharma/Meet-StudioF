// src/components/Toast.tsx
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, ShieldAlert } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:bottom-auto sm:top-6 sm:right-6 sm:left-auto sm:translate-x-0 z-50 flex flex-col gap-2.5 w-[calc(100%-2rem)] max-w-sm pointer-events-none select-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    info: <ShieldAlert className="w-4 h-4 text-indigo-400" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400" />,
  };

  const borders = {
    info: 'border-indigo-500/40 bg-slate-900/95 shadow-indigo-950/50',
    success: 'border-emerald-500/40 bg-slate-900/95 shadow-emerald-950/50',
    warning: 'border-amber-500/40 bg-slate-900/95 shadow-amber-950/50',
    error: 'border-rose-500/40 bg-slate-900/95 shadow-rose-950/50',
  };

  return (
    <div
      className={`pointer-events-auto border backdrop-blur-2xl px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 sm:slide-in-from-top-3 duration-200 ${
        borders[toast.type]
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="shrink-0">{icons[toast.type]}</div>
        <p className="text-xs sm:text-sm font-semibold text-slate-100 truncate">{toast.message}</p>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};