import React, { useEffect } from 'react';
import { LogOut, X } from 'lucide-react';

interface LeaveConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const LeaveConfirmModal: React.FC<LeaveConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  // Prevent background scrolling on mobile when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none"
      onClick={onCancel}
    >
      {/* Modal Dialog Card */}
      <div
        className="bg-slate-900 border-t sm:border border-slate-800/90 rounded-t-[2rem] sm:rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl shadow-indigo-950/50 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 duration-300 relative"
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click from closing when tapping card
      >
        {/* Mobile Handle Bar Notch */}
        <div className="w-12 h-1.5 bg-slate-700/60 rounded-full mx-auto sm:hidden -mt-2 mb-2" />

        {/* Close Button Icon */}
        <button
          type="button"
          onClick={onCancel}
          title="Cancel and stay"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-all active:scale-95 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Alert Icon */}
        <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400 shadow-inner">
          <LogOut className="w-7 h-7" />
        </div>

        {/* Text Content */}
        <div className="space-y-1.5 px-2">
          <h3 className="text-xl font-bold text-white tracking-tight">Leave call?</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Are you sure you want to exit? You can quickly rejoin using the room code or link later.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-slate-800/90 hover:bg-slate-800 text-slate-300 font-semibold py-3.5 px-4 rounded-xl sm:rounded-2xl border border-slate-700/60 active:scale-[0.98] transition-all cursor-pointer min-h-[44px] text-xs sm:text-sm"
          >
            Stay in Call
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3.5 px-4 rounded-xl sm:rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-rose-600/30 cursor-pointer min-h-[44px] text-xs sm:text-sm"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};