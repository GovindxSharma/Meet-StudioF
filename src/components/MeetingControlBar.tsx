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
  Shapes,
  Shield,
  Maximize2,
  Minimize2,
  PictureInPicture,
  Settings,
  PenTool,
  Subtitles,
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
  activeSidebar: 'details' | 'people' | 'chat' | 'activities' | 'host' | null;
  onToggleSidebar: (tab: 'details' | 'people' | 'chat' | 'activities' | 'host') => void;
  onOpenSettings: () => void;
  onOpenWhiteboard: () => void;
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
  onOpenWhiteboard,
}) => {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } =
    useLocalParticipant();

  const [currentTime, setCurrentTime] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
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
  };

  // Toggle Picture-in-Picture
  const handleTogglePip = async () => {
    try {
      setShowMoreMenu(false);
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
    <footer className="h-20 bg-[#202124] border-t border-[#3c4043] px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 select-none font-sans relative">
      {/* LEFT: Meeting Code & Clock */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => onToggleSidebar('details')}
          className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors cursor-pointer group"
          title="Meeting details"
        >
          <span className="font-semibold text-xs sm:text-sm font-mono tracking-tight group-hover:underline truncate max-w-[100px] sm:max-w-[180px]">
            {roomName}
          </span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-xs text-slate-400 font-medium hidden md:inline">{currentTime}</span>
        </button>
      </div>

      {/* CENTER: Main Pill Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 1. Microphone Toggle */}
        <button
          type="button"
          onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
          title={isMicrophoneEnabled ? 'Turn off microphone (Ctrl+D)' : 'Turn on microphone (Ctrl+D)'}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${
            isMicrophoneEnabled
              ? 'bg-[#3c4043] hover:bg-[#474a4e] text-white'
              : 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-red-500/20'
          }`}
        >
          {isMicrophoneEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* 2. Camera Toggle */}
        <button
          type="button"
          onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
          title={isCameraEnabled ? 'Turn off camera (Ctrl+E)' : 'Turn on camera (Ctrl+E)'}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${
            isCameraEnabled
              ? 'bg-[#3c4043] hover:bg-[#474a4e] text-white'
              : 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-red-500/20'
          }`}
        >
          {isCameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* 3. Closed Captions (CC) */}
        <button
          type="button"
          onClick={onToggleCaptions}
          title={captionsEnabled ? 'Turn off captions' : 'Turn on captions (c)'}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full hidden sm:flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${
            captionsEnabled
              ? 'bg-[#8ab4f8] text-[#202124] font-bold'
              : 'bg-[#3c4043] hover:bg-[#474a4e] text-white'
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
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${
              showEmojiPicker
                ? 'bg-[#8ab4f8] text-[#202124]'
                : 'bg-[#3c4043] hover:bg-[#474a4e] text-white'
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#202124] border border-[#3c4043] rounded-3xl p-2 shadow-2xl flex items-center gap-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onTriggerReaction(emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="w-10 h-10 rounded-2xl hover:bg-[#3c4043] text-2xl flex items-center justify-center transition-transform hover:scale-125 active:scale-95 cursor-pointer"
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
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full hidden sm:flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${
            isScreenShareEnabled
              ? 'bg-[#8ab4f8] text-[#202124]'
              : 'bg-[#3c4043] hover:bg-[#474a4e] text-white'
          }`}
        >
          <ScreenShare className="w-5 h-5" />
        </button>

        {/* 6. Raise Hand */}
        <button
          type="button"
          onClick={onToggleHandRaise}
          title={isHandRaised ? 'Lower hand' : 'Raise hand'}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${
            isHandRaised
              ? 'bg-amber-400 text-[#202124] font-bold shadow-amber-400/30 ring-2 ring-amber-400/50 animate-pulse'
              : 'bg-[#3c4043] hover:bg-[#474a4e] text-white'
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
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#3c4043] hover:bg-[#474a4e] text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMoreMenu && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-60 bg-[#202124] border border-[#3c4043] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl space-y-1">
              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenWhiteboard();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-slate-200 hover:bg-[#303134] hover:text-white transition-colors cursor-pointer text-left"
              >
                <PenTool className="w-4 h-4 text-[#8ab4f8]" />
                <span>Open a Whiteboard</span>
              </button>

              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-slate-200 hover:bg-[#303134] hover:text-white transition-colors cursor-pointer text-left"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#8ab4f8]" /> : <Maximize2 className="w-4 h-4 text-[#8ab4f8]" />}
                <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
              </button>

              <button
                type="button"
                onClick={handleTogglePip}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-slate-200 hover:bg-[#303134] hover:text-white transition-colors cursor-pointer text-left"
              >
                <PictureInPicture className="w-4 h-4 text-[#8ab4f8]" />
                <span>Picture-in-Picture</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-slate-200 hover:bg-[#303134] hover:text-white transition-colors cursor-pointer text-left"
              >
                <Settings className="w-4 h-4 text-[#8ab4f8]" />
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>

        {/* 8. End Call Red Pill Button */}
        <button
          type="button"
          onClick={onLeave}
          title="Leave call"
          className="w-14 sm:w-16 h-11 sm:h-12 bg-[#ea4335] hover:bg-[#d93025] text-white rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-lg shadow-red-600/30"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>

      {/* RIGHT: Sidebars Toggles */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Info */}
        <button
          type="button"
          onClick={() => onToggleSidebar('details')}
          title="Meeting details"
          className={`p-2.5 rounded-full transition-colors cursor-pointer ${
            activeSidebar === 'details'
              ? 'text-[#8ab4f8] bg-[#8ab4f8]/10'
              : 'text-slate-300 hover:text-white hover:bg-[#303134]'
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
              ? 'text-[#8ab4f8] bg-[#8ab4f8]/10'
              : 'text-slate-300 hover:text-white hover:bg-[#303134]'
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
              ? 'text-[#8ab4f8] bg-[#8ab4f8]/10'
              : 'text-slate-300 hover:text-white hover:bg-[#303134]'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-1 bg-[#1a73e8] text-white text-[9px] font-bold px-1 rounded-full min-w-[16px] text-center animate-bounce">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* Activities */}
        <button
          type="button"
          onClick={() => onToggleSidebar('activities')}
          title="Activities"
          className={`p-2.5 rounded-full transition-colors cursor-pointer ${
            activeSidebar === 'activities'
              ? 'text-[#8ab4f8] bg-[#8ab4f8]/10'
              : 'text-slate-300 hover:text-white hover:bg-[#303134]'
          }`}
        >
          <Shapes className="w-5 h-5" />
        </button>

        {/* Host Controls */}
        {isHost && (
          <button
            type="button"
            onClick={() => onToggleSidebar('host')}
            title="Host controls"
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              activeSidebar === 'host'
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-slate-300 hover:text-amber-400 hover:bg-[#303134]'
            }`}
          >
            <Shield className="w-5 h-5" />
          </button>
        )}
      </div>
    </footer>
  );
};
