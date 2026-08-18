import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

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
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 sm:bottom-auto sm:top-5 sm:right-5 sm:left-auto sm:translate-x-0 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none select-none font-sans">
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
    // Fast dismissal timer: 1800ms
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 1800);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    info: <Info className="w-4 h-4 text-[#1a73e8]" />,
    success: <CheckCircle2 className="w-4 h-4 text-[#188038]" />,
    warning: <AlertCircle className="w-4 h-4 text-[#f29900]" />,
    error: <AlertCircle className="w-4 h-4 text-[#c5221f]" />,
  };

  const borders = {
    info: 'border-[#1a73e8]/30 bg-white text-[#202124] shadow-lg',
    success: 'border-[#188038]/30 bg-white text-[#202124] shadow-lg',
    warning: 'border-[#f29900]/30 bg-white text-[#202124] shadow-lg',
    error: 'border-[#c5221f]/30 bg-white text-[#202124] shadow-lg',
  };

  return (
    <div
      className={`pointer-events-auto border px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-2.5 animate-in fade-in slide-in-from-bottom-2 sm:slide-in-from-top-2 duration-150 ${
        borders[toast.type]
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="shrink-0">{icons[toast.type]}</div>
        <p className="text-xs sm:text-sm font-semibold text-[#202124] truncate">{toast.message}</p>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-[#5f6368] hover:text-[#202124] rounded-lg transition-colors cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};