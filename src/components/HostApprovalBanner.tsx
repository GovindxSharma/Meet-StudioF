import React from 'react';
import { UserCheck, UserX, Clock, Users } from 'lucide-react';

interface PendingGuest {
  participantName: string;
  requestedAt: string;
}

interface HostApprovalBannerProps {
  pendingGuests: PendingGuest[];
  onApprove: (name: string) => void;
  onDeny: (name: string) => void;
}

export const HostApprovalBanner: React.FC<HostApprovalBannerProps> = ({
  pendingGuests,
  onApprove,
  onDeny,
}) => {
  if (pendingGuests.length === 0) return null;

  return (
    <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2.5 w-[calc(100%-2rem)] max-w-md px-2 sm:px-0 max-h-[40vh] overflow-y-auto select-none pointer-events-auto">
      
      {/* Header Indicator for Multiple Knocking Guests */}
      {pendingGuests.length > 1 && (
        <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-semibold text-amber-400 shadow-md">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {pendingGuests.length} guests waiting for entry
          </span>
          <span className="text-slate-400 font-normal">Knocking</span>
        </div>
      )}

      {/* Knocking Request Cards */}
      {pendingGuests.map((guest) => (
        <div
          key={guest.participantName}
          className="bg-slate-900/95 border border-indigo-500/40 backdrop-blur-2xl rounded-2xl p-3.5 sm:p-4 shadow-2xl shadow-indigo-950/40 flex items-center justify-between gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          {/* Guest Identity Info */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="p-2 sm:p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-white truncate leading-snug">
                {guest.participantName}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                Wants to join call
              </p>
            </div>
          </div>

          {/* Action Buttons: Deny & Admit */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onDeny(guest.participantName)}
              title="Deny entry"
              className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer min-h-[38px]"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Deny</span>
            </button>

            <button
              type="button"
              onClick={() => onApprove(guest.participantName)}
              title="Admit into room"
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer min-h-[38px]"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Admit</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};