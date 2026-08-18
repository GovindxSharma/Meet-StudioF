import React, { useEffect } from 'react';
import { UserCheck, UserX, Clock, Users } from 'lucide-react';
import { soundManager } from '../utils/soundUtils';

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
  // Play knocking sound chime when pending guests appear
  useEffect(() => {
    if (pendingGuests.length > 0) {
      soundManager.playKnock();
    }
  }, [pendingGuests.length]);

  if (pendingGuests.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2.5 w-[calc(100%-2rem)] max-w-md pointer-events-auto select-none font-sans">
      {/* Header Indicator for Multiple Knocking Guests */}
      {pendingGuests.length > 1 && (
        <div className="flex items-center justify-between bg-white border border-[#dadce0] backdrop-blur-md px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-[#b06000] shadow-md">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#f29900]" />
            {pendingGuests.length} people want to join this call
          </span>
          <span className="text-[#5f6368] font-normal">Waiting</span>
        </div>
      )}

      {/* Knocking Request Cards */}
      {pendingGuests.map((guest) => (
        <div
          key={guest.participantName}
          className="bg-white border border-[#dadce0] rounded-2xl p-3.5 sm:p-4 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          {/* Guest Identity Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2.5 bg-[#fef7e0] border border-[#fce8b2] rounded-xl text-[#f29900] shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-[#202124] truncate leading-snug">
                {guest.participantName}
              </p>
              <p className="text-[11px] text-[#5f6368] truncate mt-0.5">
                Wants to join this call
              </p>
            </div>
          </div>

          {/* Action Buttons: Deny & Admit */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onDeny(guest.participantName)}
              title="Deny entry"
              className="flex items-center gap-1 bg-[#fce8e6] hover:bg-[#fad2cf] text-[#c5221f] border border-[#fad2cf] px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Deny</span>
            </button>

            <button
              type="button"
              onClick={() => onApprove(guest.participantName)}
              title="Admit into room"
              className="flex items-center gap-1 bg-[#1a73e8] hover:bg-[#1b66ca] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-[#1a73e8]/20 transition-all active:scale-95 cursor-pointer"
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