import React, { useEffect } from 'react';
import { X, PhoneOff, Users } from 'lucide-react';

interface LeaveConfirmModalProps {
  isOpen: boolean;
  isHost?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onEndCallForEveryone?: () => void;
}

export const LeaveConfirmModal: React.FC<LeaveConfirmModalProps> = ({
  isOpen,
  isHost,
  onCancel,
  onConfirm,
  onEndCallForEveryone,
}) => {
  // Prevent background scrolling when modal is open
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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none font-sans"
      onClick={onCancel}
    >
      {/* Modal Dialog Card */}
      <div
        className="bg-white border border-[#dadce0] rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-[#5f6368] hover:text-[#202124] bg-[#f1f3f4] hover:bg-[#e8eaed] rounded-full transition-all active:scale-95 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Alert Icon */}
        <div className="w-14 h-14 bg-[#fce8e6] border border-[#fad2cf] rounded-2xl flex items-center justify-center mx-auto text-[#c5221f] shadow-inner">
          <PhoneOff className="w-7 h-7" />
        </div>

        {/* Text Content */}
        <div className="space-y-1 px-2">
          <h3 className="text-xl font-bold text-[#202124] tracking-tight">Leave call?</h3>
          <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">
            You can rejoin this call at any time using the meeting code or link.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full bg-[#ea4335] hover:bg-[#d93025] text-white font-bold py-3.5 px-4 rounded-2xl active:scale-95 transition-all shadow-md shadow-red-500/20 cursor-pointer text-xs sm:text-sm"
          >
            Leave call
          </button>

          {isHost && onEndCallForEveryone && (
            <button
              type="button"
              onClick={onEndCallForEveryone}
              className="w-full bg-[#fce8e6] hover:bg-[#fad2cf] text-[#c5221f] font-bold py-3 px-4 rounded-2xl border border-[#fad2cf] active:scale-95 transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>End call for everyone</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043] font-semibold py-3 px-4 rounded-2xl border border-[#dadce0] active:scale-95 transition-all cursor-pointer text-xs shadow-2xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};