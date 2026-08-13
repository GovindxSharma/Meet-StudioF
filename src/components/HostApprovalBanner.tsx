import React from 'react';
import { UserCheck, UserX, Clock } from 'lucide-react';

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
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md px-4">
      {pendingGuests.map((guest) => (
        <div
          key={guest.participantName}
          className="bg-slate-900/95 border border-indigo-500/40 backdrop-blur-xl rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{guest.participantName}</p>
              <p className="text-xs text-slate-400">Requesting to join call</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDeny(guest.participantName)}
              className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
            >
              <UserX className="w-3.5 h-3.5" />
              Deny
            </button>
            <button
              onClick={() => onApprove(guest.participantName)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Admit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};