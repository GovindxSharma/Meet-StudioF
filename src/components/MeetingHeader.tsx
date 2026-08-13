import React, { useState, useEffect, useRef } from 'react';
import { Video, LogOut, Users, Crown, Copy, Check, Share2, PictureInPicture, X } from 'lucide-react';

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
  const [isPipSupported, setIsPipSupported] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);

  const shareModalRef = useRef<HTMLDivElement>(null);
  const shareableUrl = `${window.location.origin}/room/${roomName}`;

  // Check if Picture-in-Picture is supported by browser/device
  useEffect(() => {
    if ('pictureInPictureEnabled' in document && document.pictureInPictureEnabled) {
      setIsPipSupported(true);
    }
  }, []);

  // Close share modal on outside click / mobile touch outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (shareModalRef.current && !shareModalRef.current.contains(event.target as Node)) {
        setShowShareModal(false);
      }
    };

    if (showShareModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showShareModal]);

  // Handle PiP Toggle for Video Tracks
  const handleTogglePip = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else {
        // Find the active video element rendered by LiveKit
        const videoElement = document.querySelector('video') as HTMLVideoElement | null;
        if (videoElement && videoElement.readyState >= 2) {
          await videoElement.requestPictureInPicture();
          setIsPipActive(true);

          videoElement.addEventListener(
            'leavepictureinpicture',
            () => setIsPipActive(false),
            { once: true }
          );
        } else {
          alert('No active video stream found to pop out into Picture-in-Picture.');
        }
      }
    } catch (err) {
      console.error('Picture-in-Picture error:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/90 px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 font-sans select-none">
      
      {/* Left Column: Branding & Room Badge */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl shadow-inner">
            <Video className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
          </div>
          <span className="font-bold text-base sm:text-lg text-white hidden md:inline tracking-tight">
            Meet Studio
          </span>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 hidden sm:block shrink-0" />

        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-indigo-300 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="truncate max-w-[110px] sm:max-w-[160px]">#{roomName}</span>
        </div>

        {isHost && (
          <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-1 rounded-lg text-xs font-semibold shrink-0">
            <Crown className="w-3 h-3" /> 
            <span className="hidden sm:inline">Host</span>
          </span>
        )}
      </div>

      {/* Right Column: PiP, Share Link, Participant Info & Leave Button */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        
        {/* Picture-in-Picture Button */}
        {isPipSupported && (
          <button
            type="button"
            onClick={handleTogglePip}
            title={isPipActive ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
              isPipActive
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 hover:bg-slate-700 text-indigo-300 border-slate-700/60'
            }`}
          >
            <PictureInPicture className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{isPipActive ? 'Exit PiP' : 'PiP'}</span>
          </button>
        )}

        {/* Share Link Button & Popover */}
        <div className="relative" ref={shareModalRef}>
          <button
            type="button"
            onClick={() => setShowShareModal(!showShareModal)}
            className="flex items-center gap-1.5 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/30 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer min-h-[38px]"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Invite</span>
          </button>

          {/* Share Modal Popover */}
          {showShareModal && (
            <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-80 max-w-[320px] bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-indigo-950/50 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs sm:text-sm font-bold text-white">Your meeting's ready</h4>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mb-3 leading-snug">
                Share this link with participants you want in the call
              </p>

              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-xl">
                <span className="text-xs text-slate-300 truncate flex-1 font-mono">{shareableUrl}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer active:scale-95 min-h-[34px] min-w-[34px] flex items-center justify-center"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {copied && <p className="text-[11px] text-emerald-400 mt-2 font-medium">✓ Link copied to clipboard!</p>}
            </div>
          )}
        </div>

        {/* Participant Name Badge */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/40 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span className="max-w-[100px] truncate">{participantName}</span>
        </div>

        {/* Leave Room Button */}
        <button
          type="button"
          onClick={onLeave}
          className="flex items-center gap-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer min-h-[38px]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </header>
  );
};