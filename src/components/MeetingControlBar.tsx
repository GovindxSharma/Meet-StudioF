import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Hand,
  Smile,
  MoreVertical,
  PhoneOff,
  Info,
  Users,
  MessageSquare,
  Shield,
  Maximize2,
  Minimize2,
  PictureInPicture,
  Settings,
  Subtitles,
  BookOpen,
  X,
} from 'lucide-react';
import { useLocalParticipant } from '@livekit/components-react';
import { EMOJI_LIST } from './EmojiReactions';

interface MeetingControlBarProps {
  roomName: string;
  isHost: boolean;
  onLeave: () => void;
  onTriggerReaction: (emoji: string) => void;
  isHandRaised: boolean;
  onToggleHandRaise: () => void;
  captionsEnabled: boolean;
  onToggleCaptions: () => void;
  participantCount: number;
  unreadMessagesCount: number;
  activeSidebar: 'details' | 'people' | 'chat' | 'host' | null;
  onToggleSidebar: (tab: 'details' | 'people' | 'chat' | 'host') => void;
  onOpenSettings: () => void;
  onOpenAbout?: () => void;
}

export const MeetingControlBar: React.FC<MeetingControlBarProps> = ({
  roomName,
  isHost,
  onLeave,
  onTriggerReaction,
  isHandRaised,
  onToggleHandRaise,
  captionsEnabled,
  onToggleCaptions,
  participantCount,
  unreadMessagesCount,
  activeSidebar,
  onToggleSidebar,
  onOpenSettings,
  onOpenAbout,
}) => {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } =
    useLocalParticipant();

  const [currentTime, setCurrentTime] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Live time ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside for popups
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
    setShowMoreMenu(false);
    setShowMobileDrawer(false);
  };

  // Toggle Picture-in-Picture
  const handleTogglePip = async () => {
    try {
      setShowMoreMenu(false);
      setShowMobileDrawer(false);
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        const videoElement = document.querySelector('video') as HTMLVideoElement | null;
        if (videoElement && videoElement.readyState >= 2) {
          await videoElement.requestPictureInPicture();
        }
      }
    } catch (e) {
      console.warn('PiP error:', e);
    }
  };

  return (
    <>
      <footer className="h-16 sm:h-20 bg-white border-t border-[#dadce0] px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 select-none font-sans relative shadow-sm">
        {/* ========================================================================= */}
        {/* DESKTOP LEFT: Room Code & Clock */}
        {/* ========================================================================= */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onToggleSidebar('details')}
            className="flex items-center gap-1.5 text-[#3c4043] hover:text-[#1a73e8] transition-colors cursor-pointer group"
            title="Meeting details"
          >
            <span className="font-semibold text-xs sm:text-sm font-mono tracking-tight group-hover:underline truncate max-w-[150px]">
              {roomName}
            </span>
            <span className="text-[#dadce0]">|</span>
            <span className="text-xs text-[#5f6368] font-medium">{currentTime}</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE CONTROL BAR: 5 Centered, Spacious, Clean Buttons */}
        {/* ========================================================================= */}
        <div className="flex sm:hidden items-center justify-around w-full max-w-xs mx-auto">
          {/* 1. Mic */}
          <button
            type="button"
            onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs ${
              isMicrophoneEnabled
                ? 'bg-[#f1f3f4] text-[#3c4043]'
                : 'bg-[#ea4335] text-white shadow-red-500/20'
            }`}
          >
            {isMicrophoneEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* 2. Cam */}
          <button
            type="button"
            onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs ${
              isCameraEnabled
                ? 'bg-[#f1f3f4] text-[#3c4043]'
                : 'bg-[#ea4335] text-white shadow-red-500/20'
            }`}
          >
            {isCameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* 3. Raise Hand */}
          <button
            type="button"
            onClick={onToggleHandRaise}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs ${
              isHandRaised
                ? 'bg-[#fef7e0] text-[#b06000] border border-[#fce8b2]'
                : 'bg-[#f1f3f4] text-[#3c4043]'
            }`}
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* 4. More Options Drawer Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMobileDrawer(true)}
              className="w-11 h-11 rounded-full bg-[#f1f3f4] text-[#3c4043] flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#1a73e8] rounded-full border-2 border-white animate-bounce" />
            )}
          </div>

          {/* 5. End Call */}
          <button
            type="button"
            onClick={onLeave}
            className="w-13 h-11 bg-[#ea4335] text-white rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md shadow-red-500/20"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP CENTER: Hardware Controls */}
        {/* ========================================================================= */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          {/* 1. Microphone Toggle */}
          <button
            type="button"
            onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
            title={isMicrophoneEnabled ? 'Turn off microphone' : 'Turn on microphone'}
            className={`w-11 sm:w-12 h-11 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs ${
              isMicrophoneEnabled
                ? 'bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043]'
                : 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-red-500/20'
            }`}
          >
            {isMicrophoneEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* 2. Camera Toggle */}
          <button
            type="button"
            onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
            title={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
            className={`w-11 sm:w-12 h-11 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs ${
              isCameraEnabled
                ? 'bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043]'
                : 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-red-500/20'
            }`}
          >
            {isCameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* 3. Closed Captions (CC) */}
          <button
            type="button"
            onClick={onToggleCaptions}
            title={captionsEnabled ? 'Turn off captions' : 'Turn on captions'}
            className={`w-11 sm:w-12 h-11 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs ${
              captionsEnabled
                ? 'bg-[#e8f0fe] text-[#1967d2] border border-[#d2e3fc]'
                : 'bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043]'
            }`}
          >
            <Subtitles className="w-5 h-5" />
          </button>

          {/* 4. Emoji Reactions Popover */}
          <div className="relative" ref={emojiPickerRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Send a reaction"
              className={`w-11 sm:w-12 h-11 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs ${
                showEmojiPicker
                  ? 'bg-[#e8f0fe] text-[#1967d2]'
                  : 'bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043]'
              }`}
            >
              <Smile className="w-5 h-5" />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white border border-[#dadce0] rounded-3xl p-2 shadow-2xl flex items-center gap-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onTriggerReaction(emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="w-10 h-10 rounded-2xl hover:bg-[#f1f3f4] text-2xl flex items-center justify-center transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Screen Share (Present Now) */}
          <button
            type="button"
            onClick={() => localParticipant.setScreenShareEnabled(!isScreenShareEnabled)}
            title={isScreenShareEnabled ? 'Stop presenting' : 'Present now'}
            className={`w-11 sm:w-12 h-11 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs ${
              isScreenShareEnabled
                ? 'bg-[#e8f0fe] text-[#1967d2] border border-[#d2e3fc]'
                : 'bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043]'
            }`}
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          {/* 6. Raise Hand */}
          <button
            type="button"
            onClick={onToggleHandRaise}
            title={isHandRaised ? 'Lower hand' : 'Raise hand'}
            className={`w-11 sm:w-12 h-11 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs ${
              isHandRaised
                ? 'bg-[#fef7e0] text-[#b06000] border border-[#fce8b2] ring-2 ring-[#f29900]/40'
                : 'bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043]'
            }`}
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* 7. More Options Dropdown */}
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              title="More options"
              className="w-11 sm:w-12 h-11 sm:h-12 rounded-full bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043] flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMoreMenu && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-60 bg-white border border-[#dadce0] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-[#3c4043] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors cursor-pointer text-left"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#1a73e8]" /> : <Maximize2 className="w-4 h-4 text-[#1a73e8]" />}
                  <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTogglePip}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-[#3c4043] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors cursor-pointer text-left"
                >
                  <PictureInPicture className="w-4 h-4 text-[#1a73e8]" />
                  <span>Picture-in-Picture</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-[#3c4043] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors cursor-pointer text-left"
                >
                  <Settings className="w-4 h-4 text-[#1a73e8]" />
                  <span>Settings</span>
                </button>

                {onOpenAbout && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      onOpenAbout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-[#1967d2] hover:bg-[#e8f0fe] transition-colors cursor-pointer text-left border-t border-[#f1f3f4] mt-1 pt-2"
                  >
                    <BookOpen className="w-4 h-4 text-[#1a73e8]" />
                    <span>About Meet Studio</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 8. End Call Red Pill Button */}
          <button
            type="button"
            onClick={onLeave}
            title="Leave call"
            className="w-16 h-11 sm:h-12 bg-[#ea4335] hover:bg-[#d93025] text-white rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md shadow-red-500/20"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP RIGHT: Sidebar Toggles (Chat, People, Details, Host) */}
        {/* ========================================================================= */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-1.5">
          {/* Info */}
          <button
            type="button"
            onClick={() => onToggleSidebar('details')}
            title="Meeting details"
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              activeSidebar === 'details'
                ? 'text-[#1a73e8] bg-[#e8f0fe]'
                : 'text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]'
            }`}
          >
            <Info className="w-5 h-5" />
          </button>

          {/* People */}
          <button
            type="button"
            onClick={() => onToggleSidebar('people')}
            title="Show everyone"
            className={`relative p-2.5 rounded-full transition-colors cursor-pointer ${
              activeSidebar === 'people'
                ? 'text-[#1a73e8] bg-[#e8f0fe]'
                : 'text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]'
            }`}
          >
            <Users className="w-5 h-5" />
            {participantCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#1a73e8] text-white text-[9px] font-bold px-1 rounded-full min-w-[16px] text-center">
                {participantCount}
              </span>
            )}
          </button>

          {/* Chat */}
          <button
            type="button"
            onClick={() => onToggleSidebar('chat')}
            title="Chat with everyone"
            className={`relative p-2.5 rounded-full transition-colors cursor-pointer ${
              activeSidebar === 'chat'
                ? 'text-[#1a73e8] bg-[#e8f0fe]'
                : 'text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#1a73e8] text-white text-[9px] font-bold px-1 rounded-full min-w-[16px] text-center animate-bounce">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Host Controls */}
          {isHost && (
            <button
              type="button"
              onClick={() => onToggleSidebar('host')}
              title="Host controls"
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                activeSidebar === 'host'
                  ? 'text-[#f29900] bg-[#fef7e0]'
                  : 'text-[#5f6368] hover:text-[#f29900] hover:bg-[#f1f3f4]'
              }`}
            >
              <Shield className="w-5 h-5" />
            </button>
          )}
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM SHEET DRAWER */}
      {/* ========================================================================= */}
      {showMobileDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200 sm:hidden"
          onClick={() => setShowMobileDrawer(false)}
        >
          <div
            className="bg-white rounded-t-3xl border-t border-[#dadce0] p-5 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-250 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Drag Bar Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#f1f3f4]">
              <div className="w-10 h-1 bg-[#dadce0] rounded-full mx-auto" />
              <button
                type="button"
                onClick={() => setShowMobileDrawer(false)}
                className="p-1 text-[#5f6368] hover:text-[#202124] rounded-full hover:bg-[#f1f3f4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Reactions Bar in Drawer */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">
                Send Reaction
              </span>
              <div className="flex items-center justify-between gap-1 bg-[#f8f9fa] p-2 rounded-2xl border border-[#dadce0]">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onTriggerReaction(emoji);
                      setShowMobileDrawer(false);
                    }}
                    className="w-8 h-8 rounded-xl text-xl flex items-center justify-center hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Action Items */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* In-Call Chat */}
              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  onToggleSidebar('chat');
                }}
                className="flex items-center gap-3 p-3 bg-[#f8f9fa] hover:bg-[#e8f0fe] border border-[#dadce0] rounded-2xl text-left transition-colors relative"
              >
                <MessageSquare className="w-5 h-5 text-[#1a73e8]" />
                <span className="text-xs font-semibold text-[#202124]">Messages</span>
                {unreadMessagesCount > 0 && (
                  <span className="ml-auto bg-[#1a73e8] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              {/* People */}
              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  onToggleSidebar('people');
                }}
                className="flex items-center gap-3 p-3 bg-[#f8f9fa] hover:bg-[#e8f0fe] border border-[#dadce0] rounded-2xl text-left transition-colors"
              >
                <Users className="w-5 h-5 text-[#188038]" />
                <span className="text-xs font-semibold text-[#202124]">People ({participantCount})</span>
              </button>

              {/* Captions Toggle */}
              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  onToggleCaptions();
                }}
                className="flex items-center gap-3 p-3 bg-[#f8f9fa] hover:bg-[#e8f0fe] border border-[#dadce0] rounded-2xl text-left transition-colors"
              >
                <Subtitles className="w-5 h-5 text-[#1a73e8]" />
                <span className="text-xs font-semibold text-[#202124]">
                  {captionsEnabled ? 'Turn off CC' : 'Show Captions'}
                </span>
              </button>

              {/* Meeting Details */}
              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  onToggleSidebar('details');
                }}
                className="flex items-center gap-3 p-3 bg-[#f8f9fa] hover:bg-[#e8f0fe] border border-[#dadce0] rounded-2xl text-left transition-colors"
              >
                <Info className="w-5 h-5 text-[#5f6368]" />
                <span className="text-xs font-semibold text-[#202124]">Meeting Info</span>
              </button>

              {/* Host Controls (if host) */}
              {isHost && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMobileDrawer(false);
                    onToggleSidebar('host');
                  }}
                  className="flex items-center gap-3 p-3 bg-[#fef7e0] border border-[#fce8b2] rounded-2xl text-left transition-colors col-span-2"
                >
                  <Shield className="w-5 h-5 text-[#f29900]" />
                  <span className="text-xs font-bold text-[#b06000]">Host Controls</span>
                </button>
              )}
            </div>

            {/* Bottom Actions: Settings & About */}
            <div className="pt-2 border-t border-[#f1f3f4] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  onOpenSettings();
                }}
                className="flex items-center gap-2 text-xs font-semibold text-[#5f6368] hover:text-[#202124] p-2 rounded-xl hover:bg-[#f1f3f4]"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              {onOpenAbout && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMobileDrawer(false);
                    onOpenAbout();
                  }}
                  className="flex items-center gap-2 text-xs font-semibold text-[#1967d2] p-2 rounded-xl hover:bg-[#e8f0fe]"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>About Meet Studio</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
