import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Plus,
  Link as LinkIcon,
  Check,
  Copy,
  Calendar,
  Keyboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Shield,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { SettingsModal } from './SettingsModal';

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
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showCreatedModal, setShowCreatedModal] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [recentMeetings, setRecentMeetings] = useState<{ code: string; date: string }[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Real-time clock & date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load recent meetings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gmeet_recent_meetings');
    if (saved) {
      try {
        setRecentMeetings(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Dropdown click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Carousel auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleCreateLinkForLater = async () => {
    setShowDropdown(false);
    const link = await onCreateLinkForLater();
    if (link) {
      setShowCreatedModal(link);
      setCopiedLink(link);
      setTimeout(() => setCopiedLink(null), 4000);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('gmeet_recent_meetings');
    setRecentMeetings([]);
  };

  const carouselItems = [
    {
      title: 'Get a link that you can share',
      desc: 'Click "New meeting" to get a link you can send to people you want to meet with.',
      icon: <LinkIcon className="w-12 h-12 text-[#8ab4f8]" />,
      accent: 'from-[#1a73e8]/20 to-[#8ab4f8]/10',
    },
    {
      title: 'See everyone together',
      desc: 'To see more people at the same time, join or start a meeting with auto-adaptive tile grids.',
      icon: <Users className="w-12 h-12 text-emerald-400" />,
      accent: 'from-emerald-600/20 to-teal-500/10',
    },
    {
      title: 'Plan ahead with scheduled calls',
      desc: 'Create secure meeting links ahead of time and invite teammates and friends.',
      icon: <Calendar className="w-12 h-12 text-amber-400" />,
      accent: 'from-amber-600/20 to-orange-500/10',
    },
    {
      title: 'Your meeting is safe and secure',
      desc: 'No one can join a meeting unless invited or admitted by the meeting host.',
      icon: <Shield className="w-12 h-12 text-violet-400" />,
      accent: 'from-violet-600/20 to-purple-500/10',
    },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-[#131314] text-white font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none relative overflow-x-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#1a73e8]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* TOP BAR */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-2 z-10">
        {/* Google Meet Branding */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-[#1a73e8] to-[#8ab4f8] rounded-2xl shadow-lg shadow-[#1a73e8]/25 flex items-center justify-center">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Google Meet <span className="text-xs font-normal text-[#8ab4f8] bg-[#8ab4f8]/10 px-2 py-0.5 rounded-full border border-[#8ab4f8]/20">Studio</span>
            </span>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-xs font-medium text-slate-300 hidden sm:flex items-center gap-2">
            <span>{currentTime}</span>
            <span className="text-slate-600">•</span>
            <span>{currentDate}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              title="Settings"
              className="p-2.5 text-slate-400 hover:text-white rounded-full hover:bg-[#202124] transition-colors cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1a73e8] to-[#8ab4f8] flex items-center justify-center text-white text-xs font-bold shadow-md">
              {participantName ? participantName.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN HERO */}
      <main className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center py-6 sm:py-10 z-10 my-auto">
        {/* LEFT COLUMN: Controls & Input */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Premium video meetings. Now free for everyone.
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
              We re-engineered the service that we built for secure business meetings, Google Meet, to make it free and available for all.
            </p>
          </div>

          <div className="space-y-5 max-w-xl">
            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Your Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="w-full bg-[#202124] border border-[#3c4043] focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative">
              {/* New Meeting Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1a73e8] hover:bg-[#1b66ca] text-white font-semibold px-6 py-3.5 rounded-2xl shadow-lg shadow-[#1a73e8]/30 active:scale-95 transition-all text-sm whitespace-nowrap cursor-pointer min-h-[48px]"
                >
                  <Video className="w-4 h-4" />
                  <span>New meeting</span>
                </button>

                {showDropdown && (
                  <div className="absolute left-0 top-14 w-72 bg-[#202124] border border-[#3c4043] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl space-y-1">
                    <button
                      type="button"
                      onClick={handleCreateLinkForLater}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-xs sm:text-sm font-medium text-slate-200 hover:text-white hover:bg-[#303134] rounded-xl transition-all text-left cursor-pointer"
                    >
                      <LinkIcon className="w-4 h-4 text-[#8ab4f8] shrink-0" />
                      <span>Create a meeting for later</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        onStartInstantMeeting();
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-xs sm:text-sm font-medium text-slate-200 hover:text-white hover:bg-[#303134] rounded-xl transition-all text-left cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#8ab4f8] shrink-0" />
                      <span>Start an instant meeting</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Code / Link Join Form */}
              <form onSubmit={onJoinWithCode} className="flex-1 flex items-center gap-2 w-full">
                <div className="relative flex-1">
                  <Keyboard className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter a code or link"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    className="w-full bg-[#202124] border border-[#3c4043] focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all min-h-[48px]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!roomInput.trim() || loading}
                  className="bg-[#202124] hover:bg-[#303134] disabled:opacity-40 text-[#8ab4f8] font-bold px-6 py-3.5 rounded-2xl border border-[#3c4043] transition-all text-sm disabled:cursor-not-allowed cursor-pointer active:scale-95 min-h-[48px] shrink-0"
                >
                  Join
                </button>
              </form>
            </div>

            {/* Recent Meetings Shortcut List (if any) */}
            {recentMeetings.length > 0 && (
              <div className="bg-[#202124]/60 border border-[#3c4043] rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8ab4f8]" /> Recent Meetings
                  </span>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentMeetings.slice(0, 4).map((m) => (
                    <button
                      key={m.code}
                      type="button"
                      onClick={() => setRoomInput(m.code)}
                      className="bg-[#303134] hover:bg-[#3c4043] text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      <span>#{m.code}</span>
                      <ArrowRight className="w-3 h-3 text-[#8ab4f8]" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Feature Carousel Card */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <div className="w-full max-w-md bg-[#202124] border border-[#3c4043] rounded-3xl p-6 sm:p-8 backdrop-blur-2xl text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Carousel Content */}
            <div className="space-y-6 transition-all duration-300">
              <div
                className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${carouselItems[carouselIndex].accent} border border-[#3c4043] flex items-center justify-center mx-auto shadow-inner`}
              >
                {carouselItems[carouselIndex].icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {carouselItems[carouselIndex].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {carouselItems[carouselIndex].desc}
                </p>
              </div>
            </div>

            {/* Carousel Navigation Dots */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  setCarouselIndex((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1))
                }
                className="p-1 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {carouselItems.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCarouselIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    carouselIndex === idx ? 'w-6 bg-[#8ab4f8]' : 'bg-[#3c4043]'
                  }`}
                />
              ))}

              <button
                type="button"
                onClick={() => setCarouselIndex((prev) => (prev + 1) % carouselItems.length)}
                className="p-1 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* CREATE FOR LATER POPUP MODAL */}
      {showCreatedModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowCreatedModal(null)}
        >
          <div
            className="bg-[#202124] border border-[#3c4043] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Here's the link to your meeting</h3>
              <button
                type="button"
                onClick={() => setShowCreatedModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-[#303134] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Copy this link and send it to people that you want to meet with. Be sure to save it so that you can use it later too.
            </p>

            <div className="flex items-center gap-2 bg-[#131314] border border-[#3c4043] p-2.5 rounded-2xl">
              <span className="text-xs font-mono text-[#8ab4f8] truncate flex-1 select-all">
                {showCreatedModal}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(showCreatedModal);
                  setCopiedLink(showCreatedModal);
                }}
                className="bg-[#1a73e8] hover:bg-[#1b66ca] text-white p-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowCreatedModal(null)}
              className="w-full bg-[#303134] hover:bg-[#3c4043] text-white py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* FOOTER */}
      <footer className="max-w-7xl w-full mx-auto text-center text-xs text-slate-600 py-3 border-t border-[#202124]">
        Google Meet • High Definition Secure Video Conferencing
      </footer>
    </div>
  );
};