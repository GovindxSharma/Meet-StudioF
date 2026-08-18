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
  BookOpen,
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
  onOpenAbout?: () => void;
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
  onOpenAbout,
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
      title: 'Get a link you can share',
      desc: 'Click "New meeting" to get a link you can send to people you want to meet with.',
      icon: <LinkIcon className="w-10 h-10 text-[#1a73e8]" />,
      bg: 'bg-[#e8f0fe]',
    },
    {
      title: 'See everyone together',
      desc: 'To see more people at the same time, join or start a meeting with auto-adaptive tile grids.',
      icon: <Users className="w-10 h-10 text-[#188038]" />,
      bg: 'bg-[#e6f4ea]',
    },
    {
      title: 'Plan ahead with scheduled calls',
      desc: 'Create secure meeting links ahead of time and invite teammates, clients, and friends.',
      icon: <Calendar className="w-10 h-10 text-[#f29900]" />,
      bg: 'bg-[#fef7e0]',
    },
    {
      title: 'Your meeting is safe and secure',
      desc: 'No one can join a meeting unless invited or admitted by the host.',
      icon: <Shield className="w-10 h-10 text-[#a142f4]" />,
      bg: 'bg-[#f3e8fd]',
    },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-[#ffffff] text-[#202124] font-sans flex flex-col justify-between p-3 sm:p-6 lg:p-8 select-none relative overflow-x-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#f8f9fa] to-transparent pointer-events-none" />

      {/* TOP NAVIGATION BAR */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-2 sm:py-3 z-10 border-b border-[#f1f3f4] pb-3 sm:pb-4">
        {/* Meet Studio Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-[#1a73e8] rounded-2xl shadow-md shadow-[#1a73e8]/20 flex items-center justify-center text-white">
            <Video className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-lg sm:text-2xl font-bold tracking-tight text-[#202124]">
            Meet Studio
          </span>
        </div>

        {/* Right Header Elements */}
        <div className="flex items-center gap-2 sm:gap-4">
          {onOpenAbout && (
            <button
              type="button"
              onClick={onOpenAbout}
              className="flex items-center gap-1.5 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1967d2] font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>About & Vision</span>
            </button>
          )}

          <div className="text-xs sm:text-sm font-medium text-[#5f6368] hidden md:flex items-center gap-2">
            <span>{currentTime}</span>
            <span className="text-[#dadce0]">•</span>
            <span>{currentDate}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              title="Settings"
              className="p-2 text-[#5f6368] hover:text-[#202124] rounded-full hover:bg-[#f1f3f4] transition-colors cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#e8f0fe] border border-[#d2e3fc] text-[#1967d2] flex items-center justify-center text-xs sm:text-sm font-bold shadow-2xs">
              {participantName ? participantName.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN HERO SECTION */}
      <main className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-14 items-center py-6 sm:py-12 z-10 my-auto">
        {/* LEFT COLUMN: Main Controls & Inputs */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
          <div className="space-y-3 sm:space-y-4">
            {onOpenAbout && (
              <button
                type="button"
                onClick={onOpenAbout}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8f0fe] hover:bg-[#d2e3fc] border border-[#d2e3fc] text-[#1967d2] text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Meet Studio Story, Workflow & Creator →</span>
              </button>
            )}
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-[#202124]">
              Premium video meetings. Now free for everyone.
            </h1>
            <p className="text-xs sm:text-base text-[#5f6368] max-w-xl leading-relaxed">
              We re-engineered Meet Studio to make high definition, secure, and encrypted video meetings accessible for all.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-5 max-w-xl">
            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6368]">
                Your Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={participantName}
                onChange={(e) => {
                  setParticipantName(e.target.value);
                  localStorage.setItem('user_display_name', e.target.value);
                }}
                className="w-full bg-[#f8f9fa] border border-[#dadce0] focus:border-[#1a73e8] focus:bg-white focus:ring-2 focus:ring-[#1a73e8]/20 rounded-2xl px-4 py-3 sm:py-3.5 text-sm text-[#202124] placeholder-[#80868b] outline-none transition-all shadow-xs"
              />
            </div>

            {/* Actions Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative">
              {/* New Meeting Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1a73e8] hover:bg-[#1b66ca] text-white font-semibold px-6 py-3.5 rounded-2xl shadow-md shadow-[#1a73e8]/20 active:scale-95 transition-all text-sm whitespace-nowrap cursor-pointer min-h-[48px]"
                >
                  <Video className="w-4 h-4" />
                  <span>New meeting</span>
                </button>

                {showDropdown && (
                  <div className="absolute left-0 top-14 w-72 bg-white border border-[#dadce0] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    <button
                      type="button"
                      onClick={handleCreateLinkForLater}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-xs sm:text-sm font-medium text-[#3c4043] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-xl transition-all text-left cursor-pointer"
                    >
                      <LinkIcon className="w-4 h-4 text-[#1a73e8] shrink-0" />
                      <span>Create a meeting for later</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        onStartInstantMeeting();
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-xs sm:text-sm font-medium text-[#3c4043] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-xl transition-all text-left cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#1a73e8] shrink-0" />
                      <span>Start an instant meeting</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Code / Link Join Form */}
              <form onSubmit={onJoinWithCode} className="flex-1 flex items-center gap-2 w-full">
                <div className="relative flex-1">
                  <Keyboard className="w-4 h-4 text-[#80868b] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter a code or link"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#dadce0] focus:border-[#1a73e8] focus:bg-white focus:ring-2 focus:ring-[#1a73e8]/20 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#202124] placeholder-[#80868b] outline-none transition-all min-h-[48px] shadow-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!roomInput.trim() || loading}
                  className="bg-[#f1f3f4] hover:bg-[#e8eaed] disabled:opacity-40 text-[#1a73e8] font-bold px-5 sm:px-6 py-3.5 rounded-2xl border border-[#dadce0] transition-all text-sm disabled:cursor-not-allowed cursor-pointer active:scale-95 min-h-[48px] shrink-0 shadow-xs"
                >
                  Join
                </button>
              </form>
            </div>

            {/* Recent Meetings History */}
            {recentMeetings.length > 0 && (
              <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-2xl p-3.5 sm:p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5f6368] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#1a73e8]" /> Recent Meetings
                  </span>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-xs text-[#5f6368] hover:text-[#d93025] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentMeetings.slice(0, 4).map((m) => (
                    <button
                      key={m.code}
                      type="button"
                      onClick={() => setRoomInput(m.code)}
                      className="bg-white hover:bg-[#e8f0fe] border border-[#dadce0] hover:border-[#1a73e8]/40 text-[#3c4043] hover:text-[#1967d2] px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>#{m.code}</span>
                      <ArrowRight className="w-3 h-3 text-[#1a73e8]" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Feature Carousel Card */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <div className="w-full max-w-md bg-white border border-[#dadce0] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
            {/* Carousel Item */}
            <div className="space-y-6 transition-all duration-300">
              <div
                className={`w-20 h-20 rounded-3xl ${carouselItems[carouselIndex].bg} flex items-center justify-center mx-auto shadow-inner`}
              >
                {carouselItems[carouselIndex].icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-[#202124] tracking-tight">
                  {carouselItems[carouselIndex].title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed max-w-xs mx-auto">
                  {carouselItems[carouselIndex].desc}
                </p>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#f1f3f4]">
              <button
                type="button"
                onClick={() =>
                  setCarouselIndex((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1))
                }
                className="p-1 text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {carouselItems.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCarouselIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    carouselIndex === idx ? 'w-6 bg-[#1a73e8]' : 'bg-[#dadce0]'
                  }`}
                />
              ))}

              <button
                type="button"
                onClick={() => setCarouselIndex((prev) => (prev + 1) % carouselItems.length)}
                className="p-1 text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* CREATE MEETING LINK POPUP MODAL */}
      {showCreatedModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowCreatedModal(null)}
        >
          <div
            className="bg-white border border-[#dadce0] rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#202124]">Here's your meeting link</h3>
              <button
                type="button"
                onClick={() => setShowCreatedModal(null)}
                className="p-1.5 text-[#5f6368] hover:text-[#202124] rounded-full hover:bg-[#f1f3f4] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">
              Copy this link and send it to people that you want to meet with. Be sure to save it so you can use it later.
            </p>

            <div className="flex items-center gap-2 bg-[#f8f9fa] border border-[#dadce0] p-3 rounded-2xl">
              <span className="text-xs font-mono text-[#1967d2] truncate flex-1 select-all font-semibold">
                {showCreatedModal}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(showCreatedModal);
                  setCopiedLink(showCreatedModal);
                }}
                className="bg-[#1a73e8] hover:bg-[#1b66ca] text-white p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95 shadow-xs"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowCreatedModal(null)}
              className="w-full bg-[#1a73e8] hover:bg-[#1b66ca] text-white py-3.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer shadow-md shadow-[#1a73e8]/20"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* FOOTER */}
      <footer className="max-w-7xl w-full mx-auto text-center text-xs text-[#5f6368] py-4 border-t border-[#f1f3f4]">
        Meet Studio • Secure Encrypted Real-Time Video Conferencing
      </footer>
    </div>
  );
};