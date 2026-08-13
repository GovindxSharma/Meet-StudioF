import React, { useState } from 'react';
import { Video, Plus, Link as LinkIcon,  Check, Sparkles, ShieldCheck } from 'lucide-react';

interface MeetLandingProps {
  roomInput: string;
  setRoomInput: (val: string) => void;
  participantName: string;
  setParticipantName: (val: string) => void;
  onStartInstantMeeting: () => void;
  onJoinWithCode: (e: React.FormEvent) => void;
  loading: boolean;
  status: 'idle' | 'pending' | 'denied';
}

export const MeetLanding: React.FC<MeetLandingProps> = ({
  roomInput,
  setRoomInput,
  participantName,
  setParticipantName,
  onStartInstantMeeting,
  onJoinWithCode,
  loading,
  status,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Generate a random Google Meet style 9-letter code (e.g., abc-defg-hij)
  const generateRandomCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const rand = (len: number) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${rand(3)}-${rand(4)}-${rand(3)}`;
  };

  const handleCreateLinkForLater = () => {
    const newCode = generateRandomCode();
    const fullUrl = `${window.location.origin}/room/${newCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(fullUrl);
    setShowDropdown(false);
    setTimeout(() => setCopiedLink(null), 4000);
  };

  return (
    <div className="min-h-screen w-full bg-[#090D16] text-white font-sans flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-2 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Video className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Meet Studio</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Encrypted WebRTC
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12 z-10">
        {/* Left Column: Google Meet Controls */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Video calls and meetings for everyone
            </h1>
            <p className="text-lg text-slate-400 max-w-lg">
              Connect, collaborate, and celebrate from anywhere with crystal clear audio and video.
            </p>
          </div>

          {/* Name & Room Inputs */}
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Your Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 relative">
              {/* "New Meeting" Dropdown Button */}
              <div className="relative w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all text-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  New meeting
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute left-0 top-14 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={handleCreateLinkForLater}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all text-left"
                    >
                      <LinkIcon className="w-4 h-4 text-indigo-400" />
                      Create a meeting link for later
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        onStartInstantMeeting();
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all text-left"
                    >
                      <Plus className="w-4 h-4 text-indigo-400" />
                      Start an instant meeting
                    </button>
                  </div>
                )}
              </div>

              {/* Paste Link / Enter Code Form */}
              <form onSubmit={onJoinWithCode} className="flex-1 flex items-center gap-2 w-full">
                <div className="relative flex-1">
                  <LinkIcon className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter code or paste meeting link"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!roomInput.trim() || loading}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-indigo-400 font-semibold px-5 py-3.5 rounded-2xl transition-all text-sm disabled:cursor-not-allowed"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Toast Notification when "Meeting Link for Later" is clicked */}
          {copiedLink && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-4 max-w-lg text-xs text-emerald-200 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 overflow-hidden">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Here's your link: <strong className="text-white">{copiedLink}</strong></span>
              </div>
              <span className="bg-emerald-500/20 px-2 py-1 rounded text-emerald-300 font-semibold shrink-0">Copied!</span>
            </div>
          )}

          {/* Status Feedback */}
          {status === 'pending' && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300 max-w-lg animate-pulse flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
              Asking host to let you in...
            </div>
          )}

          {status === 'denied' && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-300 max-w-lg">
              ❌ The host denied your request to join this meeting.
            </div>
          )}
        </div>

        {/* Right Column: Google Meet Style Visual Card */}
        <div className="flex justify-center">
          <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-2xl text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 bg-indigo-600/15 border border-indigo-500/30 rounded-3xl flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
              <Sparkles className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Get a link you can share</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Click <strong>New meeting</strong> to get a shareable URL link you can send to people you want to meet with.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center text-xs text-slate-600 py-4 border-t border-slate-950">
        Google Meet Clone • Built with LiveKit WebRTC & React
      </footer>
    </div>
  );
};