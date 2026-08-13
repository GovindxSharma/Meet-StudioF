import React, { useState } from 'react';
import { Video, LogOut, Users, Crown, Copy, Check, Share2 } from 'lucide-react';

interface MeetingHeaderProps {
  roomName: string;
  participantName: string;
  isHost: boolean;
  onLeave: () => void;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  roomName,
  participantName,
  isHost,
  onLeave,
}) => {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const shareableUrl = `${window.location.origin}/room/${roomName}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-20 font-sans">
      {/* Left: Branding & Room Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg">
            <Video className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="font-bold text-lg text-white hidden sm:inline tracking-tight">
            Meet Studio
          </span>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          #{roomName}
        </div>

        {isHost && (
          <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg text-xs font-semibold">
            <Crown className="w-3 h-3" /> Host
          </span>
        )}
      </div>

      {/* Right: Share Link, Participant Info & Leave Button */}
      <div className="flex items-center gap-3">
        {/* Share Link Button */}
        <div className="relative">
          <button
            onClick={() => setShowShareModal(!showShareModal)}
            className="flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Invite Others</span>
          </button>

          {/* Share Modal Popover */}
          {showShareModal && (
            <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <h4 className="text-sm font-semibold text-white mb-1">Your meeting's ready</h4>
              <p className="text-xs text-slate-400 mb-3">Share this link with people you want in the meeting</p>
              
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-xl">
                <span className="text-xs text-slate-300 truncate flex-1">{shareableUrl}</span>
                <button
                  onClick={handleCopy}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg text-xs font-semibold shrink-0 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {copied && <p className="text-[11px] text-emerald-400 mt-2 font-medium">Link copied to clipboard!</p>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>{participantName}</span>
        </div>

        <button
          onClick={onLeave}
          className="flex items-center gap-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Leave Room</span>
        </button>
      </div>
    </header>
  );
};