import React, { useState, useEffect, useRef } from 'react';
import { Video, Plus, Link as LinkIcon, Check, Sparkles, ShieldCheck, Copy } from 'lucide-react';

interface MeetLandingProps {
  roomInput: string;
  setRoomInput: (val: string) => void;
  participantName: string;
  setParticipantName: (val: string) => void;
  onStartInstantMeeting: () => void;
  onCreateLinkForLater: () => Promise<string | null>;
  onJoinWithCode: (e: React.FormEvent) => void;
  loading: boolean;
  status?: 'idle' | 'pending' | 'denied';
}

export const MeetLanding: React.FC<MeetLandingProps> = ({
  roomInput,
  setRoomInput,
  participantName,
  setParticipantName,
  onStartInstantMeeting,
  onCreateLinkForLater,
  onJoinWithCode,
  loading,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu on outside click / mobile touch outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showDropdown]);

  const handleCreateLinkForLater = async () => {
    setShowDropdown(false);
    const link = await onCreateLinkForLater();
    if (link) {
      setCopiedLink(link);
      setTimeout(() => setCopiedLink(null), 6000);
    }
  };

  const handleManualCopy = () => {
    if (copiedLink) {
      navigator.clipboard.writeText(copiedLink);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#090D16] text-white font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-x-hidden select-none">
      {/* Background Radial Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-indigo-600/15 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none hidden sm:block" />

      {/* Top Navigation Header */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-2 sm:py-3 z-10">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-500/20">
            <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white">Meet Studio</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold bg-slate-900/90 border border-slate-800/80 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-slate-300 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
          <span>Encrypted WebRTC</span>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center py-6 sm:py-12 z-10 my-auto">
        
        {/* Left Column: Meeting Launcher Form Controls */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4 text-left">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Video calls and meetings for everyone
            </h1>
            <p className="text-sm sm:text-lg text-slate-400 max-w-lg leading-relaxed">
              Connect, collaborate, and celebrate from anywhere with crystal clear audio and ultra-low latency video.
            </p>
          </div>

          {/* User Display Name & Room Form Inputs */}
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Your Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl sm:rounded-2xl px-4 py-3 sm:py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative">
              
              {/* "New Meeting" Dropdown Button */}
              <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold px-6 py-3.5 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all text-sm whitespace-nowrap cursor-pointer min-h-[46px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>New meeting</span>
                </button>

                {/* Dropdown Options Popover */}
                {showDropdown && (
                  <div className="absolute left-0 top-14 w-full sm:w-64 bg-slate-900 border border-slate-800/90 rounded-2xl shadow-2xl shadow-indigo-950/50 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={handleCreateLinkForLater}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all text-left cursor-pointer active:scale-[0.98]"
                    >
                      <LinkIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Create a meeting link for later</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        onStartInstantMeeting();
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all text-left cursor-pointer active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Start an instant meeting</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Paste Room Code / Link Form */}
              <form onSubmit={onJoinWithCode} className="flex-1 flex items-center gap-2 w-full">
                <div className="relative flex-1">
                  <LinkIcon className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter code or paste meeting link"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl sm:rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner min-h-[46px]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!roomInput.trim() || loading}
                  className="bg-slate-800 hover:bg-slate-700/80 disabled:opacity-40 text-indigo-400 font-semibold px-5 py-3.5 rounded-xl sm:rounded-2xl transition-all text-sm disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] min-h-[46px] shrink-0 border border-slate-700/50"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Toast Notification when Link for Later is generated */}
          {copiedLink && (
            <div className="p-4 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 max-w-lg text-xs text-emerald-200 animate-in fade-in duration-300 backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Here's your host link: <strong className="text-white select-all">{copiedLink}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleManualCopy}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 px-2.5 py-1.5 rounded-lg text-emerald-300 font-semibold shrink-0 cursor-pointer transition-all flex items-center gap-1 active:scale-95"
              >
                <Copy className="w-3 h-3" />
                <span>Copied</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Google Meet Feature Display Card */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 backdrop-blur-2xl text-center space-y-5 sm:space-y-6 shadow-2xl shadow-indigo-950/30">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600/15 border border-indigo-500/30 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Get a link you can share</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Click <strong>New meeting</strong> to generate a shareable URL link with secure host permissions attached.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="max-w-7xl w-full mx-auto text-center text-[11px] sm:text-xs text-slate-600 py-3 sm:py-4 border-t border-slate-950">
        Google Meet Clone • Built with LiveKit WebRTC & React
      </footer>
    </div>
  );
};