import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Mail, ShieldCheck, Info } from 'lucide-react';

interface MeetingDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  participantName: string;
}

export const MeetingDetailsDrawer: React.FC<MeetingDetailsDrawerProps> = ({
  isOpen,
  onClose,
  roomName,
  participantName,
}) => {
  const [copied, setCopied] = useState(false);
  const shareableUrl = `${window.location.origin}/room/${roomName}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join Google Meet: #${roomName}`,
          text: `${participantName} is inviting you to a meeting.`,
          url: shareableUrl,
        });
      } catch (err) {
        // user cancelled or error
      }
    } else {
      handleCopy();
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Join my Google Meet call: ${shareableUrl}`
  )}`;

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    `Google Meet Invitation: #${roomName}`
  )}&body=${encodeURIComponent(
    `Hi,\n\n${participantName} is inviting you to a video meeting.\n\nClick here to join: ${shareableUrl}\n\nSee you there!`
  )}`;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-[#202124] border-l border-[#3c4043] shadow-2xl flex flex-col font-sans select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#3c4043]">
        <div className="flex items-center gap-2.5">
          <Info className="w-5 h-5 text-[#8ab4f8]" />
          <h3 className="text-base font-bold text-white tracking-tight">Meeting details</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-[#303134] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6 flex-1 overflow-y-auto">
        {/* Joining info */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Joining info
          </h4>
          <div className="bg-[#171717] border border-[#3c4043] p-3.5 rounded-2xl space-y-3">
            <p className="text-xs font-mono text-[#8ab4f8] break-all select-all">{shareableUrl}</p>
            <button
              type="button"
              onClick={handleCopy}
              className="w-full bg-[#1a73e8] hover:bg-[#1b66ca] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied to Clipboard' : 'Copy Joining Info'}</span>
            </button>
          </div>
        </div>

        {/* Quick Invite Options */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Share invite
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-[#171717] hover:bg-[#2d2e30] border border-[#3c4043] rounded-xl text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#8ab4f8]" />
              <span className="text-[11px] font-medium">Share App</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 transition-all active:scale-95 cursor-pointer text-center"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-medium">WhatsApp</span>
            </a>

            <a
              href={mailtoUrl}
              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-[#171717] hover:bg-[#2d2e30] border border-[#3c4043] rounded-xl text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer text-center"
            >
              <Mail className="w-4 h-4 text-violet-400" />
              <span className="text-[11px] font-medium">Email</span>
            </a>
          </div>
        </div>

        {/* Encryption & Security card */}
        <div className="bg-[#171717] border border-[#3c4043] p-4 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold">Encrypted WebRTC</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All audio and video streams in this meeting are end-to-end encrypted and routed with ultra-low latency.
          </p>
        </div>
      </div>
    </div>
  );
};
