import React from 'react';
import { Video, ShieldCheck, Sparkles, User, Hash, Crown, UserPlus, Clock } from 'lucide-react';

interface JoinFormProps {
  roomName: string;
  setRoomName: (val: string) => void;
  participantName: string;
  setParticipantName: (val: string) => void;
  onHostJoin: (e: React.FormEvent) => void;
  onRequestJoin: () => void;
  loading: boolean;
  status: 'idle' | 'pending' | 'denied';
}

export const JoinForm: React.FC<JoinFormProps> = ({
  roomName,
  setRoomName,
  participantName,
  setParticipantName,
  onHostJoin,
  onRequestJoin,
  loading,
  status,
}) => {
  return (
    <div className="relative min-h-[100dvh] w-full bg-[#090D16] flex items-center justify-center p-4 sm:p-6 overflow-x-hidden font-sans text-slate-100 select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-indigo-600/15 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-violet-600/10 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl shadow-indigo-950/40">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/25 mb-3 sm:mb-4">
            <Video className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Meet Studio <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Enterprise-grade low-latency conferencing</p>
        </div>

        {/* Form Controls */}
        <form onSubmit={onHostJoin} className="space-y-4 sm:space-y-5">
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-indigo-400" /> Room Identifier
            </label>
            <input
              type="text"
              placeholder="e.g. design-sprint"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 sm:py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" /> Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Connor"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              required
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 sm:py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Status Feedback Messages */}
          {status === 'pending' && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center gap-2.5 text-xs font-semibold text-amber-300 animate-pulse">
              <Clock className="w-4 h-4 text-amber-400" /> Waiting for host to approve entry...
            </div>
          )}

          {status === 'denied' && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center text-xs font-semibold text-rose-300">
              ❌ Host denied your request to join this room.
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5 sm:space-y-3">
            <button
              type="submit"
              disabled={loading || status === 'pending'}
              className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer min-h-[44px]"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              {loading ? 'Connecting...' : 'Start Meeting as Host'}
            </button>

            <button
              type="button"
              onClick={onRequestJoin}
              disabled={loading || status === 'pending'}
              className="w-full bg-slate-800/90 hover:bg-slate-800 text-slate-300 font-semibold py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl border border-slate-700/60 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer min-h-[44px]"
            >
              <UserPlus className="w-4 h-4 text-indigo-400" />
              Ask to Join as Guest
            </button>
          </div>
        </form>

        {/* Security Badge */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Encrypted WebRTC LiveKit Routing
        </div>
      </div>
    </div>
  );
};