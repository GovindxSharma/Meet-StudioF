import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  LogOut,
  Users,
  Crown,
  Copy,
  Check,
  Share2,
  PictureInPicture,
  X,
  Mail,
  MessageCircle,
} from 'lucide-react';

interface MeetingHeaderProps {
  roomName: string;
  participantName: string;
  isHost: boolean;
  onLeave: () => void;
  onShowToast?: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  roomName,
  participantName,
  isHost,
  onLeave,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isPipSupported, setIsPipSupported] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);

  const shareModalRef = useRef<HTMLDivElement>(null);
  const shareableUrl = `${window.location.origin}/room/${roomName}`;

  // Check Picture-in-Picture support
  useEffect(() => {
    if ('pictureInPictureEnabled' in document && document.pictureInPictureEnabled) {
      setIsPipSupported(true);
    }
  }, []);

  // Close share modal on click / touch outside
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

  // Handle PiP Toggle
  const handleTogglePip = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else {
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
          if (onShowToast) onShowToast('No active video stream found for PiP', 'warning');
        }
      }
    } catch (err) {
      console.error('Picture-in-Picture error:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    if (onShowToast) onShowToast('Meeting link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  // Native Web Share API (Triggers native share sheet on mobile/Safari)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join Meet Studio Room: #${roomName}`,
          text: `${participantName} is inviting you to a video meeting on Meet Studio.`,
          url: shareableUrl,
        });
      } catch (err) {
        console.log('User cancelled share or API error', err);
      }
    } else {
      handleCopy();
    }
  };

  // WhatsApp Share Link
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Join my Meet Studio video call: ${shareableUrl}`
  )}`;

  // Email Mailto Link
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    `Invitation to Meet Studio Video Call: #${roomName}`
  )}&body=${encodeURIComponent(
    `Hi,\n\n${participantName} is inviting you to a video meeting.\n\nClick the link to join: ${shareableUrl}\n\nSee you there!`
  )}`;

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/90 px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 font-sans select-none">
      {/* Left Column */}
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

      {/* Right Column */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* PiP Button */}
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

        {/* Share Button & Expanded Popover */}
        <div className="relative" ref={shareModalRef}>
          <button
            type="button"
            onClick={() => setShowShareModal(!showShareModal)}
            className="flex items-center gap-1.5 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/30 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer min-h-[38px]"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Invite</span>
          </button>

          {/* Share Options Popover */}
          {showShareModal && (
            <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-80 max-w-[340px] bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-indigo-950/50 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs sm:text-sm font-bold text-white">Share Meeting Link</h4>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mb-3 leading-snug">
                Send an invite to participants via link, app, or email.
              </p>

              {/* Direct Link Copy Box */}
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-xl mb-3">
                <span className="text-xs text-slate-300 truncate flex-1 font-mono">{shareableUrl}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer active:scale-95 min-h-[34px] min-w-[34px] flex items-center justify-center"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Multiple Sharing Options Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
                {/* 1. Native Mobile Share Sheet */}
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] font-medium">Share App</span>
                </button>

                {/* 2. WhatsApp Direct Share */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 transition-all active:scale-95 cursor-pointer text-center"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-medium">WhatsApp</span>
                </a>

                {/* 3. Email Invite */}
                <a
                  href={mailtoUrl}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer text-center"
                >
                  <Mail className="w-4 h-4 text-violet-400" />
                  <span className="text-[10px] font-medium">Email Invite</span>
                </a>
              </div>
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