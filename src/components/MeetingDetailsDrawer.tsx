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
          title: `Join Meet Studio: #${roomName}`,
          text: `${participantName} is inviting you to a meeting on Meet Studio.`,
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
    `Join my Meet Studio video call: ${shareableUrl}`
  )}`;

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    `Meet Studio Invitation: #${roomName}`
  )}&body=${encodeURIComponent(
    `Hi,\n\n${participantName} is inviting you to a video meeting on Meet Studio.\n\nClick here to join: ${shareableUrl}\n\nSee you there!`
  )}`;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white border-l border-[#dadce0] shadow-2xl flex flex-col font-sans select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#dadce0]">
        <div className="flex items-center gap-2.5">
          <Info className="w-5 h-5 text-[#1a73e8]" />
          <h3 className="text-base font-bold text-[#202124] tracking-tight">Meeting details</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-[#5f6368] hover:text-[#202124] rounded-full hover:bg-[#f1f3f4] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6 flex-1 overflow-y-auto bg-white">
        {/* Joining info */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5f6368]">
            Joining info
          </h4>
          <div className="bg-[#f8f9fa] border border-[#dadce0] p-4 rounded-2xl space-y-3 shadow-2xs">
            <p className="text-xs font-mono text-[#1967d2] break-all select-all font-semibold">{shareableUrl}</p>
            <button
              type="button"
              onClick={handleCopy}
              className="w-full bg-[#1a73e8] hover:bg-[#1b66ca] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied to Clipboard' : 'Copy Joining Info'}</span>
            </button>
          </div>
        </div>

        {/* Quick Invite Options */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5f6368]">
            Share invite
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-[#f8f9fa] hover:bg-[#e8f0fe] border border-[#dadce0] rounded-2xl text-[#3c4043] hover:text-[#1967d2] transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <Share2 className="w-4 h-4 text-[#1a73e8]" />
              <span className="text-[11px] font-semibold">Share App</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-[#e6f4ea] hover:bg-[#ceead6] border border-[#ceead6] rounded-2xl text-[#188038] transition-all active:scale-95 cursor-pointer text-center shadow-2xs"
            >
              <MessageCircle className="w-4 h-4 text-[#188038]" />
              <span className="text-[11px] font-semibold">WhatsApp</span>
            </a>

            <a
              href={mailtoUrl}
              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-[#f3e8fd] hover:bg-[#e8d0fb] border border-[#e8d0fb] rounded-2xl text-[#a142f4] transition-all active:scale-95 cursor-pointer text-center shadow-2xs"
            >
              <Mail className="w-4 h-4 text-[#a142f4]" />
              <span className="text-[11px] font-semibold">Email</span>
            </a>
          </div>
        </div>

        {/* Encryption & Security card */}
        <div className="bg-[#f8f9fa] border border-[#dadce0] p-4 rounded-2xl space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-[#188038]">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold">Encrypted WebRTC</span>
          </div>
          <p className="text-[11px] text-[#5f6368] leading-relaxed">
            All audio and video in Meet Studio are end-to-end encrypted and routed with ultra-low latency.
          </p>
        </div>
      </div>
    </div>
  );
};
