import React, { useEffect } from 'react';
import { X, UserX, ShieldAlert, VolumeX, Users, Shield } from 'lucide-react';

interface HostControlsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  participants?: any[];
  onMuteAll: () => void;
  onRemoveParticipant: (identity: string) => void;
}

export const HostControlsDrawer: React.FC<HostControlsDrawerProps> = ({
  isOpen,
  onClose,
  participants = [],
  onMuteAll,
  onRemoveParticipant,
}) => {
  // Prevent background scrolling on mobile when drawer is active
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
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex justify-end flex-col sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border-t sm:border border-slate-800/90 rounded-t-[2rem] sm:rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-5 max-h-[85dvh] sm:max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent closing when tapping inside
      >
        {/* Mobile Handle Bar Notch */}
        <div className="w-12 h-1.5 bg-slate-700/60 rounded-full mx-auto sm:hidden -mt-1 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Host Controls
              </h3>
              <p className="text-[11px] text-slate-400">Room management tools</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close drawer"
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full transition-all active:scale-95 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Action: Mute All */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onMuteAll}
            className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold py-3 px-4 rounded-xl sm:rounded-2xl text-xs flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all cursor-pointer min-h-[44px] shadow-sm"
          >
            <VolumeX className="w-4 h-4 text-rose-400" /> 
            <span>Mute All Participants</span>
          </button>
        </div>

        {/* Participant Moderation List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> Active Roster
            </h4>
            <span className="text-[11px] bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded-md text-slate-300 font-medium">
              {participants.length} connected
            </span>
          </div>

          {participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-950/40 border border-slate-800/60 rounded-2xl">
              <Shield className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-400">No active guests to moderate</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Connected participants will appear here
              </p>
            </div>
          ) : (
            participants.map((p) => (
              <div
                key={p.identity}
                className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
                    {p.identity.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white truncate">
                    {p.identity}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveParticipant(p.identity)}
                  className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0 min-h-[38px]"
                >
                  <UserX className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};